import type { AlbumsAnswer } from "@/api/Albums";
import { AlbumRow } from "@/components/catalogue/AlbumRow";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export type CatalogueReading = "loading" | AlbumsAnswer;

export function Catalogue({ reading }: { reading: CatalogueReading }) {
	let content = <AlbumRow albums={[]} />;
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
		content = <AlbumRow albums={reading.albums} />;
	}
	return content;
}
