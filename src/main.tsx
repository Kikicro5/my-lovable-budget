import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initBilling } from "./services/billing";

// Initialize billing on app start
initBilling();

createRoot(document.getElementById("root")!).render(<App />);

