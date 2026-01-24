# Git-happens

## Setup

### Install Dependencies
```bash
npm install
```

### Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your environment variables in `.env`:
   - `API_URL` - Your API endpoint
   - `FIREBASE_API_KEY` - Firebase API key
   - `FIREBASE_AUTH_DOMAIN` - Firebase auth domain
   - `FIREBASE_PROJECT_ID` - Firebase project ID

### Usage
Import environment variables in your code:
```typescript
import { API_URL, FIREBASE_API_KEY } from '@env';
```

### Run the App
```bash
npm start
```