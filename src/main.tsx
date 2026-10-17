import createClient from "openapi-fetch";
import { createRoot } from "react-dom/client";
import { App } from "@/App";
import { HealthCheck } from "@/api/HealthCheck";
import type { paths } from "@/api/schema";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement === null) {
	throw new Error("#root not found");
}

const client = createClient<paths>({ baseUrl: window.location.origin });
const healthCheck = new HealthCheck(client);

createRoot(rootElement).render(<App healthCheck={healthCheck} />);
