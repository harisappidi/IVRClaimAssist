# 📞 IVRClaimAssist

**IVRClaimAssist** is a voice-based IVR (Interactive Voice Response) chatbot that streamlines the customer experience for rental car repair tracking. It is specifically designed to **bridge the gap between customers and car rental companies like Enterprise**, by automating the process of checking repair status updates—eliminating long wait times, redundant identity verification, and unnecessary call transfers.

Built with **Twilio Programmable Voice**, **Node.js (Express.js)**, and **Firebase Firestore**, IVRClaimAssist provides a simple and scalable way for customers to retrieve real-time repair updates through a phone call.

---

## 🎯 Problem It Solves

When a customer reports vehicle damage to a rental company (e.g., Enterprise), they receive a **claim number** to track the **car repair process**. But when they call customer support for status updates, the experience is often inefficient:

- Multiple teams get involved.
- Customers have to **verify identity twice** (name, mailing address).
- Call transfers cause **long wait times (5+ minutes)**.
- Updates like "parts ordered", "car inspected", or "repair in progress" require **manual queries by agents**.

These repetitive steps waste time—especially when the customer is on a **deadline (e.g., 60-day claim limit from a credit card company like Amex)** to gather repair documentation.

**IVRClaimAssist** solves this by giving the customer a **self-service voice bot** that:
- Accepts phone calls.
- Verifies the caller once.
- Fetches real-time repair status via an internal API or Firestore.
- Speaks back the results immediately.

---

## 🔧 Tech Stack

| Layer               | Technology                      |
|---------------------|----------------------------------|
| Voice Platform      | Twilio Programmable Voice        |
| Backend Server      | Node.js + Express.js             |
| Database            | Firebase Firestore               |
| Hosting (Optional)  | Render / Railway / Firebase Functions |
| Identity Handling   | Voice prompts + Firestore match  |
| Data Access         | Claim & repair updates from Firestore (or proxy API) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (Node Package Manager)
- ngrok (for local webhook tunneling)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd IVRClaimAssist
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
     ```bash
     touch .env
     ```
   - Fill in the required values in the `.env` file.

### Running the Project

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Expose the local server to the internet using ngrok:
   ```bash
   ngrok http 3000
   ```
   - Note the public URL provided by ngrok and configure it in your Twilio webhook settings.

### Project Structure

- `src/index.ts`: Entry point of the application.
- `.env`: Environment variables (not committed to version control).
- `.env.example`: Sample environment variables file.

### Features

- Handles incoming POST requests from Twilio.
- Placeholder route for Twilio webhook.
- Modular code structure for scalability.

---
### Team Info
Team Name: VoiceHackers
Track: AI/ML
Harikrishna Sappidi
Siva Sai Narayana Singh Udaya

### Video Demonstration:
https://www.loom.com/share/d06bd971d09e46128d67f670b621b132?sid=0a59647f-9f6b-4fbe-af2b-2e9d9c0e76f3
