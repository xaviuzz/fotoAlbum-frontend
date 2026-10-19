import { useState } from "react";
import type { AlbumsAnswer } from "@/api/Albums";
import { AlbumRow } from "@/components/catalogue/AlbumRow";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export type CatalogueReading = "loading" | AlbumsAnswer;

export function Catalogue({ reading }: { reading: CatalogueReading }) {
	const [hasFailedCreating, setHasFailedCreating] = useState(false);
	const failCreating = () => setHasFailedCreating(true);

	let content = <AlbumRow albums={[]} onFailure={failCreating} />;
	if (reading === "loading") {
		content = (
			<p
				role="status"
				aria-label="Cargando álbumes"
				className="text-muted-foreground"
			>
				Cargando…
			</p>
		);
	} else if (reading.status === "error") {
		content = (
			<Alert variant="destructive">
				<AlertTitle>No se pudo cargar el catálogo</AlertTitle>
			</Alert>
		);
	} else if (reading.albums.length === 0) {
		content = (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>El catálogo está vacío</EmptyTitle>
				</EmptyHeader>
			</Empty>
		);
	} else {
		let creationAlert = null;
		if (hasFailedCreating) {
			creationAlert = (
				<Alert variant="destructive">
					<AlertTitle>No se pudo crear el álbum</AlertTitle>
				</Alert>
			);
		}
		content = (
			<>
				{creationAlert}
				<AlbumRow albums={reading.albums} onFailure={failCreating} />
			</>
		);
	}
	return content;
}
