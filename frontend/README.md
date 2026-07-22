# Knitting App Frontend

React + TypeScript + Vite frontend for the Yarn Pattern Matcher.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server (make sure the Python backend is running on port 8000):
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

The dev server proxies API calls to the backend running on http://localhost:8000

## Build

```bash
npm run build
```

Builds to `dist/` which can be served by the FastAPI backend.

## Architecture

- **YarnSearchScreen**: Initial yarn search input
- **YarnConfirmScreen**: Disambiguation of yarn results
- **PatternResultsScreen**: Pattern results with optional filtering

All API calls go through the backend (`/api/*` endpoints).
