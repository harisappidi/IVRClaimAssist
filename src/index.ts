import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import pino from 'pino';
import ivrRoutes from './routes/ivrRoutes';

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

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 5 * 60 * 1000 // 5 minutes session timeout
  }
}));

// Middleware
app.use(express.urlencoded({ extended: true })); // For parsing Twilio webhook requests
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// IVR Routes
app.use('/ivr', ivrRoutes);

// Root route handler
app.get('/', (req, res) => {
  res.send('IVRClaimAssist API is running.');
});

// Placeholder route for Twilio webhook
app.post('/twilio-webhook', (req, res) => {
  res.send('Twilio webhook endpoint');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

// Replace console.log with logger
logger.info('Starting IVRClaimAssist server...');

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
  logger.info(`Health check available at http://localhost:${port}/health`);
});