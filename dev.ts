import index from "./index.html";

const apiUrl = process.env.API_URL ?? "http://localhost:3000";

function proxyTo(path: string) {
	return (request: Request) => fetch(new URL(path, apiUrl), request);
}

function proxyKeepingPath(request: Request) {
	const { pathname } = new URL(request.url);
	return fetch(new URL(pathname, apiUrl), request);
}

Bun.serve({
	port: Number(process.env.PORT ?? 5173),
	routes: {
		"/*": index,
		"/health.check": proxyTo("/health.check"),
		"/album.list": proxyTo("/album.list"),
		"/album.get": proxyTo("/album.get"),
		"/userAlbum.create": proxyTo("/userAlbum.create"),
		"/userAlbum.get": proxyTo("/userAlbum.get"),
		"/photo.list": proxyTo("/photo.list"),
		"/photo.upload": proxyTo("/photo.upload"),
		"/photos/*": proxyKeepingPath,
	},
	development: true,
});
