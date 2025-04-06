import VoiceResponse = require('twilio/lib/twiml/VoiceResponse');
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
      input: ['dtmf', 'speech'],
      timeout: 6,  // Increased from 5
      numDigits: 1,
      action: '/ivr/collect-name',
      hints: 'yes, ready, start',
    }).say({
      voice: 'Polly.Joanna',
    }, 'Press 1 or say ready when you\'re ready to begin.');

    // Add a fallback response if Gather times out
    response.say({
      voice: 'Polly.Joanna',
    }, 'I didn\'t receive your response. Please try again.');

    // Redirect back to welcome to try again
    response.redirect('/ivr/welcome');

    return response.toString();
  }

  /**
   * Generates TwiML to collect user's full name
   */
  generateCollectName(): string {
    const response = new this.twiml.VoiceResponse();
    
    response.gather({
      input: ['speech'],
      timeout: 7,  // Increased from 3
      action: '/ivr/collect-street',
      hints: 'my name is',
    }).say({
      voice: 'Polly.Joanna',
    }, 'Please say your full name exactly as it appears on your claim.');

    return response.toString();
  }

  /**
   * Generates TwiML to collect user's street address
   */
  generateCollectStreet(): string {
    const response = new this.twiml.VoiceResponse();
    
    response.gather({
      input: ['speech'],
      timeout: 8,  // Increased from 5
      action: '/ivr/collect-city',
      hints: 'my address is',
    }).say({
      voice: 'Polly.Joanna',
    }, 'Please say your street address as it appears on your claim.');

    return response.toString();
  }

  /**
   * Generates TwiML to collect user's city
   */
  generateCollectCity(): string {
    const response = new this.twiml.VoiceResponse();
    
    response.gather({
      input: ['speech'],
      timeout: 7,  // Increased from 3
      action: '/ivr/collect-state',
    }).say({
      voice: 'Polly.Joanna',
    }, 'Please say the name of your city.');

    // Add retry logic if no input is received
    response.say({
      voice: 'Polly.Joanna',
    }, 'I didn\'t hear your city. Please try again.');
    
    // Redirect back to the same endpoint
    response.redirect('/ivr/collect-city');

    return response.toString();
  }

  /**
   * Generates TwiML to collect user's state
   */
  generateCollectState(): string {
    const response = new this.twiml.VoiceResponse();
    
    response.gather({
      input: ['speech'],
      timeout: 7,  // Increased from 3
      action: '/ivr/collect-zipcode',
    }).say({
      voice: 'Polly.Joanna',
    }, 'Please say the name of your state.');

    // Add retry logic if no input is received
    response.say({
      voice: 'Polly.Joanna',
    }, 'I didn\'t hear your state. Please try again.');
    
    // Redirect back to the same endpoint
    response.redirect('/ivr/collect-state');

    return response.toString();
  }

  /**
   * Generates TwiML to collect user's ZIP code
   */
  generateCollectZipCode(): string {
    const response = new this.twiml.VoiceResponse();
    
    response.gather({
      input: ['dtmf'],
      timeout: 10,  // Increased from 3
      numDigits: 5,
      action: '/ivr/verify-identity',
    }).say({
      voice: 'Polly.Joanna',
    }, 'Finally, please enter your 5-digit ZIP code using your keypad.');

    // Add retry logic if no input is received
    response.say({
      voice: 'Polly.Joanna',
    }, 'I didn\'t receive your ZIP code. Please try again.');
    
    // Redirect back to the same endpoint
    response.redirect('/ivr/collect-zipcode');

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

  /**
   * Generates TwiML for invalid input with redirect
   */
  generateInvalidInputResponse(message: string, redirectUrl: string): string {
    const response = new this.twiml.VoiceResponse();
    
    response.say({
      voice: 'Polly.Joanna',
    }, message);
    
    response.redirect(redirectUrl);
    
    return response.toString();
  }
}