# Monay Productivity

A modern productivity suite that combines email management, smart calendar scheduling, and AI-powered features to streamline your workflow.

## Features

### 📧 Smart Email Management

- Automatic email summarization and prioritization
- AI-powered email response suggestions
- Email archiving and organization
- Priority-based inbox view
- Visual indicators for replied and priority status

### 📅 Intelligent Calendar Integration

- AI-powered event scheduling from emails
- Smart scheduling based on busy times and preferences
- Natural language event creation
- Google Calendar integration
- Timezone-aware scheduling

### 🤖 AI Assistant Features

- Natural language task scheduling
- Smart reply generation
- Automated event detail extraction from emails
- Context-aware scheduling suggestions
- User preference-based customization

## Tech Stack

- **Frontend**: Next.js, TypeScript, React
- **UI Components**: Shadcn UI
- **Authentication**: Clerk
- **AI Integration**: OpenAI GPT-4
- **APIs**: Google Gmail, Google Calendar
- **State Management**: React Hook Form, Zod

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Google Cloud Platform account
- OpenAI API key
- Clerk account

### Environment Setup

Create a `.env` file with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Installation

1. Clone the repository

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Run the development server

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Email Management**

   - View your inbox with AI-generated summaries
   - Emails are automatically prioritized
   - Click on an email to view details and take actions
   - Archive or reply to emails with AI assistance

2. **Calendar Scheduling**

   - Use natural language to create events
   - Schedule events directly from emails
   - AI will suggest optimal times based on your calendar
   - Manage attendees and event details

3. **AI Features**
   - Type natural language commands to schedule events
   - Get AI-powered email reply suggestions
   - Automatic event detail extraction from emails
   - Smart scheduling based on preferences

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
