import 'express-session';

declare module 'express-session' {
  interface SessionData {
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
  }
}