import { Router, Request, Response, RequestHandler } from 'express';
import { TwilioService } from '../services/twilioService';
import { CallFlowService } from '../services/callFlowService';
import { MailingAddress } from '../models/users';
import twilio from 'twilio';
import '../types/session';

const router = Router();
const twilioService = new TwilioService();
const callFlowService = new CallFlowService();

// Twilio webhook validation middleware
const validateRequest = twilio.webhook({ validate: process.env.NODE_ENV === 'production' });

// Define route handlers with proper typing
const handleVerifyIdentity: RequestHandler = async (req, res) => {
  const zipCode = req.body.Digits;
  const phoneNumber = req.body.From;
  const { fullName, street, city, state } = req.session;

  // Validate that all required information is present
  if (!fullName || !street || !city || !state || !zipCode) {
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

    res.type('text/xml');
    if (success) {
      res.send(twilioService.generateClaimStatus(message));
    } else {
      res.send(twilioService.generateErrorResponse(message));
    }
  } catch (error) {
    console.error('Error in verify-identity route:', error);
    res.type('text/xml');
    res.send(twilioService.generateErrorResponse(
      'We encountered an error processing your request. Please try again later.'
    ));
  }
};

// Route definitions
router.post('/welcome', validateRequest, (req, res) => {
  // Clear any existing session data
  req.session.fullName = undefined;
  req.session.street = undefined;
  req.session.city = undefined;
  req.session.state = undefined;
  
  res.type('text/xml');
  res.send(twilioService.generateWelcomeMessage());
});

router.post('/collect-name', validateRequest, (req, res) => {
  res.type('text/xml');
  res.send(twilioService.generateCollectName());
});

router.post('/collect-street', validateRequest, (req, res) => {
  const fullName = req.body.SpeechResult;
  req.session.fullName = fullName;
  
  res.type('text/xml');
  res.send(twilioService.generateCollectStreet());
});

router.post('/collect-city', validateRequest, (req, res) => {
  const street = req.body.SpeechResult;
  req.session.street = street;
  
  res.type('text/xml');
  res.send(twilioService.generateCollectCity());
});

router.post('/collect-state', validateRequest, (req, res) => {
  const city = req.body.SpeechResult;
  req.session.city = city;
  
  res.type('text/xml');
  res.send(twilioService.generateCollectState());
});

router.post('/collect-zipcode', validateRequest, (req, res) => {
  const state = req.body.SpeechResult;
  req.session.state = state;
  
  res.type('text/xml');
  res.send(twilioService.generateCollectZipCode());
});

router.post('/verify-identity', validateRequest, handleVerifyIdentity);

export default router;