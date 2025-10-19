import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './setupUser.ts' // Setup subscription function for console

createRoot(document.getElementById("root")!).render(<App />);
