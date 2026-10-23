import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// In dev, /api calls are proxied to the FastAPI backend (no CORS problems while developing).
export default defineConfig({ plugins:[react()], server:{ proxy:{ '/api':'http://localhost:8000' } } })
