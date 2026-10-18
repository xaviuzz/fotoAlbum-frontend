import type { AlbumAnswer } from "@/api/Albums";
import { AlbumCharacteristics } from "@/components/making/AlbumCharacteristics";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export type AlbumMakingReading = "loading" | AlbumAnswer;

export function AlbumMaking({ reading }: { reading: AlbumMakingReading }) {
	let content = (
		<Alert variant="destructive">
			<AlertTitle>No se pudo cargar el álbum</AlertTitle>
		</Alert>
	);
	if (reading === "loading") {
		content = (
			<p
				role="status"
				aria-label="Cargando álbum"
				className="text-muted-foreground"
			>
				Cargando…
			</p>
		);
	} else if (reading.status === "ok") {
		content = <AlbumCharacteristics album={reading.album} />;
	} else if (reading.code === "ALBUM_NOT_FOUND") {
		content = (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Álbum no encontrado</EmptyTitle>
				</EmptyHeader>
			</Empty>
		);
	}
	return content;
}
