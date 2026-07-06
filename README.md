# PathFinder 10 🚀

An immersive, 3D Career Navigator web application designed specifically for 10th-grade students in Telangana, India. PathFinder 10 guides students in choosing between three critical education pathways:
1. **Intermediate (MPC/BiPC/CEC/HEC)** - General academic and competitive exam preparations.
2. **Polytechnic Diploma** - Applied technical engineering with direct routes to industry or B.Tech (via TS ECET lateral entry).
3. **ITI Trades** - Practical vocational careers, rapid placement, and Indian Railways Assistant Loco Pilot (ALP) qualifications.

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (via CDN), and **Three.js** (for dynamic 3D undulating background particle fields, 3D assessment trophies, and AI holographic advisor cores).
- **Backend**: **Node.js (Express)**, securing and proxying connections to the Gemini AI API.
- **Databases & Authentication**: Integration with the **Firebase Web SDK** (Authentication & Firestore) with a robust, zero-friction local storage **Guest Mode fallback**.
- **AI Engine**: **Google Gemini (gemini-2.5-flash)** using secure, backend-proxied streaming queries.

---

## 🌟 Immersive 3D Animations & Aesthetics

- **Organic Wave Particles**: A custom-engineered Three.js particle canvas background undulating programmatically over time using wave physics, responding dynamically to cursor movement for depth and parallax.
- **3D Glassmorphism**: High-blur background panels, sleek neon glows, and custom CSS transformations (`perspective: 1000px`, `transform-style: preserve-3d`).
- **Interactive Cursor Tilt**: Cards and comparison cells tilt, rotate, and elevate in 3D coordinate space relative to the cursor's location.
- **3D Assessment Flip**: Quiz questions rotate on a horizontal 180-degree flip platform, tracking completion state on a liquid progress bar.
- **Interactive 3D Trophy**: A glowing golden trophy rendered in Three.js on assessment completion, supporting mouse drag and touch swipe coordinates to rotate.
- **Thinking Holographic Core**: A complex Three.js wireframe sphere and perpendicular orbital rings representing the AI Advisor that spins, glows, and pulses rapidly when wait-states compile responses.

---

## 💻 Local Quick Start

Follow these steps to run the application on your computer:

### 1. Prerequisites
Ensure you have [Node.js (v18+)](https://nodejs.org/) installed.

### 2. Install Dependencies
In the project directory, run:
```bash
# On Windows (Cmd bypass execution policies):
npm.cmd install

# On macOS/Linux:
npm install
```

### 3. Setup Environment Variables
Create a file named `.env` in the root folder (or copy `.env.example`):
```bash
PORT=3000
GEMINI_API_KEY=your_google_gemini_api_key_here
```
> **Note**: If you don't have a Gemini API key yet, the application runs automatically in **Demo Mode**, using custom-tailored local mock advisors to answer student queries!

### 4. Run the Server
Launch the Node development server:
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 🚀 Production Deployment to Render.com

Render is an excellent platform for deploying Node.js applications with native environment variable protection. Follow these steps to host PathFinder 10 live:

### 1. Create a Web Service on Render
1. Sign in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub/GitLab repository containing the project files.

### 2. Configure Build & Start Commands
Under the Service Settings, define the following variables:
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Region**: Select a region closest to your users (e.g., `Singapore` for India).
- **Instance Type**: `Free`

### 3. Add Environment Variables
Navigate to the **Environment** tab in your Render Web Service settings and add:
1. `GEMINI_API_KEY`: Paste your live Google Gemini API key (from Google AI Studio).
2. `PORT`: `3000` (Optional; Render binds ports automatically).
3. If using Firebase, add your Firebase Config values to prevent fallbacks:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

Click **Save Changes**. Render will automatically deploy your build, and your 3D Career Navigator will be live!
