# Fixing Supabase Login (Email Confirmation)

Since you are running on `localhost`, you have two options to fix the email confirmation issue:

## Option 1: Disable Email Confirmation (Recommended for Dev)
1. Go to your **Supabase Dashboard** (https://supabase.com/dashboard).
2. Open your Project.
3. On the left sidebar, click **Authentication** -> **Providers**.
4. Click on **Email** (it should be enabled).
5. Toggle **OFF** "Confirm email".
6. Click **Save**.
7. Go to **Authentication** -> **Users** and delete the user you just tried to create (to clear the "waiting for confirmation" state).
8. Go back to your localhost app (`http://localhost:3000/login`) and Sign Up again. You should be logged in immediately.

## Option 2: Fix Redirect URL
If you want to keep email confirmation:
1. Go to **Authentication** -> **URL Configuration**.
2. Set **Site URL** to `http://localhost:3000`.
3. Under **Redirect URLs**, add `http://localhost:3000/**`.
4. Click **Save**.
5. When you click the link in your email, it should now correctly redirect you to your local app.
