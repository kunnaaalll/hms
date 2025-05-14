
# Firebase Studio - Lavender Luxury Hotel Management

This is a Next.js starter project for a hotel management application, built in Firebase Studio.
This version uses a local `src/lib/data.json` file for data persistence instead of a database.

## Getting Started Locally

To run this project on your local machine, follow these steps:

### 1. Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm

### 2. Clone the Repository

If you haven't already, clone this repository to your local machine.

### 3. Install Dependencies

Navigate to the project directory in your terminal and install the necessary dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Environment Variables (Optional for AI Features)

If you plan to use the AI features (like date suggestions), create a `.env` file in the root of your project and add your Google API Key:

```env
# For Genkit (if using Google AI features, ensure your Google Cloud project is set up for API access)
# GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY" 
# You can get this from the Google Cloud Console. Make sure the Gemini API is enabled for your project.
```
The application will use `src/lib/data.json` for storing room, booking, and settings data. This file will be created automatically if it doesn't exist when you first run the application or a server action interacts with it.

### 5. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application should now be running, typically at `http://localhost:9002`.
The booking and room management functionalities will read from and write to `src/lib/data.json`.

### 6. Run Genkit Development Server (Optional)

If you are working with Genkit flows and want to use the Genkit developer UI (usually available at `http://localhost:4000`), run:

```bash
npm run genkit:dev
```
Or for auto-reloading on changes:
```bash
npm run genkit:watch
```

## Available Scripts

*   `dev`: Starts the Next.js development server (Turbopack enabled).
*   `genkit:dev`: Starts the Genkit development server.
*   `genkit:watch`: Starts the Genkit development server with auto-reload.
*   `build`: Builds the application for production.
*   `start`: Starts a Next.js production server.
*   `lint`: Runs ESLint.
*   `typecheck`: Runs TypeScript type checking.

## Project Structure Highlights

*   `src/app/`: Next.js App Router pages and layouts.
    *   `src/app/admin/`: Admin dashboard pages.
    *   `src/app/page.tsx`: Main customer-facing booking interface.
*   `src/components/`: Reusable React components.
    *   `src/components/ui/`: ShadCN UI components.
    *   `src/components/booking/`: Components related to the booking interface.
    *   `src/components/admin/`: Components specific to the admin dashboard.
*   `src/lib/`: Utility functions, type definitions (`types.ts`), mock data (`mockData.ts` - used for initial structure), and the JSON data store (`jsonDataStore.ts`, `data.json`).
*   `src/ai/`: Genkit related files.
    *   `src/ai/flows/`: Genkit flow definitions.
*   `.env`: Environment variables (ignored by Git).
*   `public/`: Static assets.
