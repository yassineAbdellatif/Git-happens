# Git-happens

## Setup

### 1. Install Dependencies
Open two terminals:
   - `app/frontend`
   - `app/backend`

In each terminal, run:
```bash
npm install
```

### 2. Google Maps API Keys
You need to obtain **two separate Google Maps API keys** from the [Google Cloud Console](https://console.cloud.google.com/):
- One for the frontend (with Maps JavaScript API enabled)
- One for the backend (with Directions API enabled)

### 3. Configure Environment Variables

#### Frontend (.env)
Create a `.env` file in the `app/frontend` folder with:
```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_frontend_api_key_here
EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:3000
```
Replace `YOUR_IP` with your local IP address (e.g., `192.168.1.100`)

#### Backend (.env)
Create a `.env` file in the `app/backend` folder with:
```
GOOGLE_MAPS_API_KEY=your_backend_api_key_here
```

### 4. Run the Application

#### Start Backend
In the `app/backend` terminal:
1.
```bash
npx expo prebuild
```
2.
```bash
npx expo run:ios
```
or
```bash
npx expo run:android
```

#### Start Frontend
In the `app/frontend` terminal:
```bash
npm start
```
On the application "expo go" on your phone, scan the QR code displayed in the frontend terminal with your phone connected to the same network.