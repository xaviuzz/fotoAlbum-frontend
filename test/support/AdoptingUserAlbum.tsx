import { type ReactNode, useState } from "react";
import { UserAlbumContext } from "@/contexts/UserAlbumContext";
import type { PresentedAlbum } from "@/domain/album/PresentedAlbum";

export function AdoptingUserAlbum({
	initial,
	children,
}: {
	initial: PresentedAlbum;
	children: ReactNode;
}) {
	const [userAlbum, adopt] = useState<PresentedAlbum>(initial);

	return (
		<UserAlbumContext.Provider value={{ userAlbum, adopt }}>
			{children}
		</UserAlbumContext.Provider>
	);
}
