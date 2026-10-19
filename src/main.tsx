import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "@/App";
import { ApiProvider } from "@/api/ApiContext";
import { SessionStore } from "@/lib/SessionStore";
import { SessionProvider } from "@/session/SessionContext";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement === null) {
	throw new Error("#root not found");
}

createRoot(rootElement).render(
	<SessionProvider store={SessionStore.inBrowser()}>
		<ApiProvider baseUrl={window.location.origin}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</ApiProvider>
	</SessionProvider>,
);
