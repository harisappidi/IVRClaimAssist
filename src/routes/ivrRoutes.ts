import { Router, Request, Response, RequestHandler } from 'express';
import { TwilioService } from '../services/twilioService';
import { CallFlowService } from '../services/callFlowService';
import { MailingAddress } from '../models/users';
import twilio from 'twilio';
import '../types/session';
import pino from 'pino';

const router = Router();
const twilioService = new TwilioService();
const callFlowService = new CallFlowService();

// Initialize logger with better formatting
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname'
    }
  }
});

// Twilio webhook validation middleware
const validateRequest = twilio.webhook({ validate: process.env.NODE_ENV === 'production' });

// Define route handlers with proper typing
const handleVerifyIdentity: RequestHandler = async (req, res) => {
  const zipCode = req.body.Digits;
  const phoneNumber = req.body.From;
  const { fullName, street, city, state } = req.session;

  logger.info({
    event: 'Verification attempt',
    phoneNumber,
    fullName,
    address: { street, city, state, zipCode },
    callSid: req.body.CallSid
  }, 'Attempting to verify user');

  // Validate that all required information is present
  if (!fullName || !street || !city || !state || !zipCode) {
    logger.warn({
      event: 'Verification failed',
      reason: 'Missing information',
      callSid: req.body.CallSid,
      missing: {
        fullName: !fullName,
        street: !street,
        city: !city,
        state: !state,
        zipCode: !zipCode
      }
    }, 'Verification failed: Missing information');

    res.type('text/xml');
    res.send(twilioService.generateErrorResponse(
      'Some required information is missing. Please start over.'
    ));
    return;
  }

  try {
    // Construct the complete mailing address
    const mailingAddress: MailingAddress = {
      street,
      city,
      state,
      zipCode
    };

    const { success, message } = await callFlowService.handleVerificationAndClaimRetrieval(
      phoneNumber,
      fullName,
      mailingAddress
    );

    logger.info({
      event: 'Verification result',
      success,
      phoneNumber,
      callSid: req.body.CallSid
    }, `Verification ${success ? 'succeeded' : 'failed'}: ${message}`);

    res.type('text/xml');
    if (success) {
      res.send(twilioService.generateClaimStatus(message));
    } else {
      res.send(twilioService.generateErrorResponse(message));
    }
  } catch (error) {
    logger.error({
      event: 'Verification error',
      error,
      callSid: req.body.CallSid
    }, 'Error during verification');

    console.error('Error in verify-identity route:', error);
    res.type('text/xml');
    res.send(twilioService.generateErrorResponse(
      'We encountered an error processing your request. Please try again later.'
    ));
  }
};

// Route definitions
router.post('/welcome', validateRequest, (req, res) => {
  logger.info({
    event: 'New call received',
    from: req.body.From,
    callSid: req.body.CallSid
  }, 'Call started');

  // Clear any existing session data
  req.session.fullName = undefined;
  req.session.street = undefined;
  req.session.city = undefined;
  req.session.state = undefined;
  
  res.type('text/xml');
  res.send(twilioService.generateWelcomeMessage());
});

router.post('/collect-name', validateRequest, (req, res) => {
  const dtmfDigit = req.body.Digits;
  const speechInput = req.body.SpeechResult;

  logger.info({
    event: 'Initial response received',
    input: speechInput || dtmfDigit,
    type: speechInput ? 'speech' : 'dtmf',
    confidence: req.body.Confidence,
    callSid: req.body.CallSid
  }, `User responded: ${speechInput || dtmfDigit}`);

  // Clean up speech input if present
  const cleanedSpeechInput = speechInput ? 
    speechInput.replace(/[.,!?]+$/, '').trim().toLowerCase() : '';

  // Validate the initial response (either "1" or variations of "ready")
  if ((dtmfDigit && dtmfDigit === '1') || 
      (cleanedSpeechInput === 'ready')) {
    res.type('text/xml');
    res.send(twilioService.generateCollectName());
  } else {
    // If invalid input, use the new method to generate response
    res.type('text/xml');
    res.send(twilioService.generateInvalidInputResponse(
      'I didn\'t understand your response. Let\'s try again.',
      '/ivr/welcome'
    ));
  }
});

router.post('/collect-street', validateRequest, (req, res) => {
  const rawFullName = req.body.SpeechResult;
  // Clean up the name by removing trailing punctuation and extra spaces
  const fullName = rawFullName.replace(/[.,!?]+$/, '').trim();
  
  logger.info({
    event: 'Full name received',
    rawInput: rawFullName,
    cleanedName: fullName,
    confidence: req.body.Confidence,
    callSid: req.body.CallSid
  }, `User name: ${fullName}`);

  req.session.fullName = fullName;
  
  res.type('text/xml');
  res.send(twilioService.generateCollectStreet());
});

router.post('/collect-city', validateRequest, (req, res) => {
  const rawStreet = req.body.SpeechResult;
  const street = rawStreet.replace(/[.,!?]+$/, '').trim();
  
  logger.info({
    event: 'Street address received',
    rawInput: rawStreet,
    cleanedStreet: street,
    confidence: req.body.Confidence,
    callSid: req.body.CallSid
  }, `Street address: ${street}`);

  req.session.street = street;
  
  res.type('text/xml');
  res.send(twilioService.generateCollectCity());
});

router.post('/collect-state', validateRequest, (req, res) => {
  const rawCity = req.body.SpeechResult;
  const city = rawCity.replace(/[.,!?]+$/, '').trim();
  
  logger.info({
    event: 'City received',
    rawInput: rawCity,
    cleanedCity: city,
    confidence: req.body.Confidence,
    callSid: req.body.CallSid
  }, `City: ${city}`);

  req.session.city = city;
  
  res.type('text/xml');
  res.send(twilioService.generateCollectState());
});

router.post('/collect-zipcode', validateRequest, (req, res) => {
  const rawState = req.body.SpeechResult;
  const state = rawState.replace(/[.,!?]+$/, '').trim();
  
  logger.info({
    event: 'State received',
    rawInput: rawState,
    cleanedState: state,
    confidence: req.body.Confidence,
    callSid: req.body.CallSid
  }, `State: ${state}`);

  req.session.state = state;
  
  res.type('text/xml');
  res.send(twilioService.generateCollectZipCode());
});

router.post('/verify-identity', validateRequest, handleVerifyIdentity);

export default router;