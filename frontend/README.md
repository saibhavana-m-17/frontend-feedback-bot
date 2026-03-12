# Developer Feedback Bot - Frontend

A simple Angular chat interface for collecting developer feedback through conversational dialogue.

## Features

- Clean chat interface with message bubbles
- Auto-start conversation on load
- Real-time message exchange with bot
- Simple error handling
- Responsive design

## Prerequisites

- Node.js 18+ and npm
- Backend server running on http://localhost:3000

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm start
```

The app will be available at http://localhost:4200

## Build

Build for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── chat/              # Main chat interface
│   ├── services/
│   │   └── api.service.ts     # Backend API communication
│   ├── app.component.ts       # Root component
│   └── app.config.ts          # App configuration
├── index.html                 # Main HTML file
├── main.ts                    # Application entry point
└── styles.css                 # Global styles
```

## API Integration

The frontend communicates with the backend API at `http://localhost:3000`:

- `POST /api/feedback/conversations` - Start new conversation
- `POST /api/feedback/conversations/:id/messages` - Send message

## Usage

1. Start the backend server
2. Start the frontend with `npm start`
3. Open http://localhost:4200 in your browser
4. The bot will greet you automatically
5. Type your responses and click Send or press Enter
