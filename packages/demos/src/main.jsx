import { createRoot } from "react-dom/client";
import App from "./App";

const root = document.getElementById("root");
const app = <div key="1">app</div>;
console.log(app);
createRoot(root).render(<App />);
