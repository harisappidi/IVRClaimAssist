import express from 'express';
import dotenv from 'dotenv';
import pino from 'pino';

// Load environment variables
dotenv.config();

// Initialize Pino logger
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Placeholder route for Twilio webhook
app.post('/twilio-webhook', (req, res) => {
  res.send('Twilio webhook endpoint');
});

// Replace console.log with logger
logger.info('Starting IVRClaimAssist server...');

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});