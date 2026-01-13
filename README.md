<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1XqVo10nDUesCD3nhOmRxAzm8W1pbfgai

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. **Push your code to GitHub.**
2. **Import the project in Vercel.**
3. **Configure Environment Variables:** In the Vercel project settings, add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
   - `GEMINI_API_KEY`: Your Gemini API key (if used in functionality).
4. **Deploy.** Vercel will automatically detect Vite and run the build command.

> [!IMPORTANT]
> Make sure all environment variables are correctly set in Vercel, or the app will not be able to connect to Supabase.
