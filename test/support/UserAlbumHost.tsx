import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { ApiProvider } from "@/api/ApiContext";
import { UserAlbumContext } from "@/userAlbum/UserAlbumContext";
import { FreshSession } from "./FreshSession";

const neverAnswers = () => new Promise<Response>(() => {});

export function UserAlbumHost({
	fetch = neverAnswers,
	children,
}: {
	fetch?: (request: Request) => Promise<Response>;
	children: ReactNode;
}) {
	return (
		<FreshSession>
			<ApiProvider baseUrl="http://localhost" fetch={fetch}>
				<MemoryRouter>
					<UserAlbumContext.Provider
						value={{ userAlbum: null, adopt: () => {} }}
					>
						{children}
					</UserAlbumContext.Provider>
				</MemoryRouter>
			</ApiProvider>
		</FreshSession>
	);
}
