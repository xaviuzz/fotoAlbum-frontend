import { useEffect, useState } from "react";
import type { Album, AlbumsAnswer } from "@/api/Albums";
import { useAlbums } from "@/api/ApiContext";
import { AlbumCard } from "@/components/AlbumCard";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

type Reading = "loading" | AlbumsAnswer;

export function HomePage() {
	const albums = useAlbums();
	const [reading, setReading] = useState<Reading>("loading");

	useEffect(() => {
		let isCurrent = true;
		albums.list().then((answer) => {
			if (isCurrent) {
				setReading(answer);
			}
		});
		return () => {
			isCurrent = false;
		};
	}, [albums]);

	return (
		<main
			aria-label="Catálogo"
			className="flex flex-col items-center gap-6 p-6"
		>
			<h2 className="text-2xl font-semibold">Elige un álbum</h2>
			<Catalogue reading={reading} />
		</main>
	);
}

function Catalogue({ reading }: { reading: Reading }) {
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

function AlbumRow({ albums }: { albums: Album[] }) {
	const cards = [];
	for (const album of albums) {
		cards.push(
			<li key={album.reference} className="flex">
				<AlbumCard album={album} />
			</li>,
		);
	}
	return (
		<ul className="flex w-1/2 gap-4 overflow-x-auto pb-2 [&>:first-child]:ml-auto [&>:last-child]:mr-auto">
			{cards}
		</ul>
	);
}
