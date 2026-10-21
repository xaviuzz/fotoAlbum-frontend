import createClient, { type ClientOptions } from "openapi-fetch";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { Api } from "@/api/Api";
import type { paths } from "@/api/schema";
import { useSession } from "@/contexts/SessionContext";

const ApiContext = createContext<Api | null>(null);

export function ApiProvider({
	baseUrl,
	fetch,
	children,
}: {
	baseUrl: string;
	fetch?: ClientOptions["fetch"];
	children: ReactNode;
}) {
	const { session } = useSession();
	const api = useMemo(() => {
		const client = createClient<paths>({ baseUrl, fetch });
		return new Api(client, session);
	}, [baseUrl, fetch, session]);

	return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

function useApi(hook: string) {
	const api = useContext(ApiContext);
	if (api === null) {
		throw new Error(`${hook} needs an ApiProvider`);
	}
	return api;
}

export function useHealthCheck() {
	return useApi("useHealthCheck").healthCheck;
}

export function useAlbums() {
	return useApi("useAlbums").albums;
}

export function usePhotos() {
	return useApi("usePhotos").photos;
}

export function useUserAlbums() {
	return useApi("useUserAlbums").userAlbums;
}
