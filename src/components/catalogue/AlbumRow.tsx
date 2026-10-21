import { useState } from "react";
import { AlbumCard } from "@/components/catalogue/AlbumCard";
import { Alert, AlertTitle } from "@/components/ui/alert";
import type { PresentedAlbum } from "@/domain/album/PresentedAlbum";

const MAX_ALBUMS_THAT_FIT = 3;

export function AlbumRow({ albums }: { albums: PresentedAlbum[] }) {
	const [hasFailedCreating, setHasFailedCreating] = useState(false);
	const failCreating = () => setHasFailedCreating(true);

	let cardSlot = "flex w-64 shrink-0";
	if (albums.length <= MAX_ALBUMS_THAT_FIT) {
		cardSlot = "flex min-w-0 flex-1";
	}
	const cards = [];
	for (const album of albums) {
		cards.push(
			<li key={album.reference} className={cardSlot}>
				<AlbumCard album={album} onFailure={failCreating} />
			</li>,
		);
	}
	let creationAlert = null;
	if (hasFailedCreating) {
		creationAlert = (
			<Alert variant="destructive">
				<AlertTitle>No se pudo crear el álbum</AlertTitle>
			</Alert>
		);
	}
	return (
		<>
			{creationAlert}
			<ul className="flex h-[50vh] w-1/2 gap-4 overflow-x-auto pb-2 [&>:first-child]:ml-auto [&>:last-child]:mr-auto">
				{cards}
			</ul>
		</>
	);
}
