import { createContext, useContext } from "react";
import type { PresentedAlbum } from "@/domain/album/PresentedAlbum";

export type CurrentUserAlbum = {
	userAlbum: PresentedAlbum | null;
	adopt: (userAlbum: PresentedAlbum) => void;
};

export const UserAlbumContext = createContext<CurrentUserAlbum | null>(null);

export function useCurrentUserAlbum() {
	const current = useContext(UserAlbumContext);
	if (current === null) {
		throw new Error("useCurrentUserAlbum needs a UserAlbumGate");
	}
	return current;
}
