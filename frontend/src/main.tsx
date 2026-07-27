import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

const posthogToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN
const posthogHost = import.meta.env.VITE_POSTHOG_HOST

console.log('PostHog token available:', !!posthogToken)
console.log('PostHog host available:', !!posthogHost)

if (posthogToken && posthogHost) {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    defaults: '2026-05-30',
  })
} else if (import.meta.env.DEV) {
  console.error(
    'VITE_POSTHOG_PROJECT_TOKEN or VITE_POSTHOG_HOST variable required by PostHog is missing or un-configured, ' +
    'this causes events to be silently missed. This error stops appearing once those variables are configured.'
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </React.StrictMode>,
)
