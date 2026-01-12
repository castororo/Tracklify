# Deploying Tracklify to Render 🚀

Render is a robust platform that provides persistent backend services (great for Node.js/Express) and static site hosting.

## Prerequisites
1.  **Push your code** to GitHub (Client and Server in the same repo).
2.  **Sign up** for [Render.com](https://render.com/).

---

## Part 1: Deploy the Backend (Web Service)

1.  Click **New +** -> **Web Service**.
2.  Connect your `Tracklify` GitHub repository.
3.  **Configure the Service**:
    *   **Name**: `tracklify-api` (or similar)
    *   **Root Directory**: `server` (Important! This tells Render where the API code lives)
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
    *   **Instance Type**: Free (or Starter for production performance)

4.  **Environment Variables** (Advanced):
    *   Add your secrets here:
        *   `MONGO_URI`: (Your MongoDB Atlas connection string)
        *   `JWT_SECRET`: (A secure random string)
        *   `CLIENT_URL`: **IMPORTANT**: You won't know this until you deploy the frontend (Part 2). For now, put a placeholder like `https://temp-frontend.onrender.com`. We will update this later.
        *   `NODE_ENV`: `production`

5.  Click **Create Web Service**. 
    *   Wait for deployment. Validating: It should print "MongoDB connected" in logs.
    *   **Copy the URL** (e.g., `https://tracklify-api.onrender.com`). You need this for Part 2.

---

## Part 2: Deploy the Frontend (Static Site)

1.  Click **New +** -> **Static Site**.
2.  Connect the **same** `Tracklify` GitHub repository.
3.  **Configure the Site**:
    *   **Name**: `tracklify`
    *   **Root Directory**: `client` (Important! This tells Render where the React code lives)
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `dist` (Vite builds to `dist` by default)

4.  **Environment Variables**:
    *   `VITE_API_URL`: Paste your **Backend URL** from Part 1 (e.g., `https://tracklify-api.onrender.com/api/v1`).
        *   *Note: Ensure you include `/api/v1` at the end if your frontend expects it, or just the base URL if your code appends it. Our code appends `/api/v1` in `api.ts` usually, let's check: Code says `const API_BASE_URL = ...env.VITE_API_URL ... /api/v1`. So just the HOST is needed if configured that way, OR full path. The code: `${import.meta.env.VITE_API_URL || ''}/api/v1`. So `VITE_API_URL` should be the **Base Domain**, e.g., `https://tracklify-api.onrender.com`. (Without `/api/v1`).*

5.  **Redirects/Rewrites** (Crucial for React Router):
    *   Go to **Redirects/Rewrites** tab (or define in Settings).
    *   Add a rule:
        *   **Source**: `/*`
        *   **Destination**: `/index.html`
        *   **Action**: Rewrite
    *   *Why?* This ensures that refreshing the page on `/projects` works instead of 404ing.

6.  Click **Create Static Site**.

---

## Part 3: Connect Them

1.  Once your **Frontend** is live, copy its URL (e.g., `https://tracklify.onrender.com`).
2.  Go back to your **Backend (Web Service)** settings.
3.  **Update Environment Variable**:
    *   Update `CLIENT_URL` to your actual frontend URL (`https://tracklify.onrender.com`).
    *   Saving this will trigger a backend redeploy.

## Done! 🎉
Your app is now fully production-ready on Render.
