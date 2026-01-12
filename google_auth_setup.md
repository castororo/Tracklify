# Google Authentication Setup for Production

Since your app is now live on Render, you must verify your Google Cloud Console settings to ensure "Sign in with Google" works.

## 1. Credentials
Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).

## 2. Authorized JavaScript Origins
Add your **Frontend URL**:
*   `https://tracklify.onrender.com`

## 3. Authorized Redirect URIs
Add your **Backend URL** + the callback path:
*   `https://tracklify-api.onrender.com/api/v1/auth/google/callback`

> **Note**: Be extremely careful with slashes. It must match exactly.

## 4. Render Environment Variables
Ensure your **Backend** (Web Service) on Render has:
*   `GOOGLE_CLIENT_ID`: (Your credentials)
*   `GOOGLE_CLIENT_SECRET`: (Your credentials)
*   `CLIENT_URL`: `https://tracklify.onrender.com` (Your frontend)

---

### Troubleshooting "Double Slash" Error
If you see `//api/v1...` errors:
1.  Go to Render > Frontend > Environment Variables.
2.  Check `VITE_API_URL`.
3.  Ensure it does **NOT** have a trailing slash.
    *   **Correct**: `https://tracklify-api.onrender.com`
    *   **Incorrect**: `https://tracklify-api.onrender.com/`

I have also patched the code to handle the slash automatically, but it's good practice to keep the variable clean.
