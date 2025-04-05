import { VoiceResponse } from 'twilio/lib/twiml/VoiceResponse';
import twilio from 'twilio';

export class TwilioService {
  private twiml: typeof twilio.twiml;

  constructor() {
    this.twiml = twilio.twiml;
  }

  /**
   * Generates the welcome message TwiML
   */
  generateWelcomeMessage(): string {
    const response = new this.twiml.VoiceResponse();
    
    response.say({
      voice: 'Polly.Joanna',
    }, 'Welcome to the Repair Claim Assistant. I can help you check the status of your repair claim.');

    response.gather({
      input: 'dtmf speech',
      timeout: 3,
      numDigits: 1,
      action: '/ivr/collect-name',
      hints: 'yes, ready, start',
    }).say({
      voice: 'Polly.Joanna',
    }, 'Press 1 or say ready when you\'re ready to begin.');

    return response.toString();
  }

  /**
   * Generates TwiML to collect user's full name
   */
  generateCollectName(): string {
    const response = new this.twiml.VoiceResponse();
    
    response.gather({
      input: 'speech',
      timeout: 3,
      action: '/ivr/collect-zipcode',
      hints: 'my name is',
    }).say({
      voice: 'Polly.Joanna',
    }, 'Please say your full name exactly as it appears on your claim.');

    return response.toString();
  }

  /**
   * Generates TwiML to collect user's ZIP code
   */
  generateCollectZipCode(): string {
    const response = new this.twiml.VoiceResponse();
    
    response.gather({
      input: 'dtmf',
      timeout: 3,
      numDigits: 5,
      action: '/ivr/verify-identity',
    }).say({
      voice: 'Polly.Joanna',
    }, 'Please enter your 5-digit ZIP code using your keypad.');

    return response.toString();
  }

  /**
   * Generates TwiML for claim status response
   */
  generateClaimStatus(statusMessage: string): string {
    const response = new this.twiml.VoiceResponse();
    
    response.say({
      voice: 'Polly.Joanna',
    }, statusMessage);

    response.say({
      voice: 'Polly.Joanna',
    }, 'Thank you for using the Repair Claim Assistant. Goodbye!');

    response.hangup();

    return response.toString();
  }

  /**
   * Generates TwiML for error scenarios
   */
  generateErrorResponse(errorMessage: string): string {
    const response = new this.twiml.VoiceResponse();
    
    response.say({
      voice: 'Polly.Joanna',
    }, errorMessage);

    response.say({
      voice: 'Polly.Joanna',
    }, 'Please try again later or contact customer service for assistance. Goodbye.');

    response.hangup();

    return response.toString();
  }
}