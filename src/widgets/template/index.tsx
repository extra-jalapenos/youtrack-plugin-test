import "@jetbrains/ring-ui-built/components/style.css";

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@jetbrains/ring-ui-built/components/style.css";
import "./app.css"
import App from './app.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
