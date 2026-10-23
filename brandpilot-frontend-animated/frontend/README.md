# BrandPilot AI: Frontend (Chandhini B)
React 18 + Vite + Tailwind CSS. Calls the real `POST /api/review` (see the shared contract in the team guide).

## Run
1. `npm install`
2. Start the backend (Priyanshi's FastAPI on port 8000), or for UI testing only: `npm run mock`
3. `npm run dev` and open the URL shown (http://localhost:5173)

## Backend URL
Development: leave `VITE_API_URL` empty; Vite proxies `/api` to `http://localhost:8000` (edit `vite.config.js` to change).
Deployed build: copy `.env.example` to `.env`, set `VITE_API_URL=https://your-backend`, run `npm run build`, host `dist/`. The backend must allow your frontend origin in CORS.

## Files
`src/api.js` API client and error messages · `src/App.jsx` form, states, actions · `src/components/FindingCard.jsx` finding card · `src/sample.js` sample reference data · `mock-server.js` dev mock only.

## Libraries
react, react-dom, vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer. No AI calls or API keys in the frontend.
