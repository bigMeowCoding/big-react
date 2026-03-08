import { createRoot } from "react-dom";

const root = document.getElementById("root");
const app = <div key="1">app</div>;
createRoot(root).render(app);
console.log(app);
