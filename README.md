# 🛡️ Real-Time Authentication Monitoring & Threat Detection System

A 100% free-tier compatible Security Operations Center (SOC) dashboard and real-time threat detection system built with **React (Vite)**, **Tailwind CSS (Glassmorphism)**, **Recharts**, **Firebase (Auth, Firestore, Hosting)**, and **Leaflet Geolocation Mapping**.

> 💡 **Firebase Spark (Free Plan) Ready**: Powered by client-side threat evaluation and Firestore `onSnapshot` real-time listeners. Zero Cloud Functions or GCP Blaze billing required!

---

## 🌟 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS (Glassmorphism), Recharts, Lucide React, Leaflet Maps
- **Backend Services**: Firebase Authentication, Cloud Firestore (Real-time `onSnapshot` subscriptions), Firebase Hosting
- **Telemetry**: Public IP & Geolocation API integration + User-Agent device fingerprinting

---

## 🎯 Threat Detection Rules (Running Client-Side via Firestore)

1. **⚡ Brute Force Detection (High Severity)**:
   - Evaluates consecutive failed login attempts within a 5-minute sliding window for the same user/email.
   - If count $\ge 5$, triggers a High-Severity Alert and sets `locked: true` on the user document in Firestore.

2. **✈️ Impossible Travel Velocity Detection (High Severity)**:
   - Calculates distance in km using the **Haversine formula** between current and previous successful login geolocations.
   - Computes implied speed $v = d / \Delta t$. If implied speed $> 800$ km/h (and distance $> 50$ km), fires a High-Severity Alert and auto-locks the user account.

3. **💻 New Device Signature Fingerprint (Medium Severity)**:
   - Compares client browser and OS fingerprint against `knownDevices` stored in `users/{userId}`.
   - Creates a Medium-Severity Alert if an unrecognized device is detected.

4. **🌙 Unusual Operating Hours Detection (Low Severity)**:
   - Flags authentication events occurring between 01:00 AM and 05:00 AM outside standard operating hours.

---

## 🎨 Glassmorphism & Modern SOC Aesthetics

- **Frosted Glass Cards & Panels**: Built with `bg-white/10`, `backdrop-blur-xl`, `border-white/15`, and soft rounded corners (`rounded-2xl`).
- **Severity-Tinted Glowing Cards**:
  - 🔴 **High Severity Alert**: Glowing Red Tint (`bg-red-500/10`, `border-red-500/30`, `glow-severity-high`)
  - 🟡 **Medium Severity Alert**: Glowing Yellow Tint (`bg-amber-500/10`, `border-amber-500/30`, `glow-severity-medium`)
  - 🔵 **Low Severity Alert**: Glowing Cyan Tint (`bg-cyan-500/10`, `border-cyan-500/30`, `glow-severity-low`)

---

## 🚀 How to Run & Connect Firebase

### 1. Run Locally in Standalone Demo Mode
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` to interact with the dashboard immediately!

---

### 2. Connect your Live Firebase Project (Free Spark Plan)

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication** (Email/Password) and **Cloud Firestore**.
3. Create a `.env` file in the `frontend` folder ([frontend/.env](file:///c:/Users/harini/Desktop/Real-time%20authentication%20monitoring%20&%20threat%20detection%20system/frontend/.env)):
   ```env
 VITE_FIREBASE_API_KEY=AIzaSyBHWVEDxDAhk69MlB9rIkHcUcYnsixxKz8
VITE_FIREBASE_AUTH_DOMAIN=auth-threat-monitor-70301.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=auth-threat-monitor-70301
VITE_FIREBASE_STORAGE_BUCKET=auth-threat-monitor-70301.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=379409973675
VITE_FIREBASE_APP_ID=1:379409973675:web:8f644971b11026f60a52ee
   ```
4. Deploy Firestore Rules:
   ```bash
   npx firebase deploy --only firestore:rules
   ```

---

## 📄 License
MIT License
