import index from "./index.html";

const apiUrl = process.env.API_URL ?? "http://localhost:3000";

Bun.serve({
	port: Number(process.env.PORT ?? 5173),
	routes: {
		"/": index,
		"/health.check": (request) =>
			fetch(new URL("/health.check", apiUrl), request),
	},
	development: true,
});
