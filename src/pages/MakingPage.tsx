import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { Album, AlbumAnswer } from "@/api/Albums";
import { useAlbums } from "@/api/ApiContext";
import {
	bindingLabels,
	orientationLabels,
	sizeLabel,
} from "@/components/albumLabels";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

type Reading = "loading" | AlbumAnswer;

export function MakingPage() {
	const { reference = "" } = useParams();
	const albums = useAlbums();
	const [reading, setReading] = useState<Reading>("loading");

	useEffect(() => {
		let isCurrent = true;
		setReading("loading");
		albums.get(reference).then((answer) => {
			if (isCurrent) {
				setReading(answer);
			}
		});
		return () => {
			isCurrent = false;
		};
	}, [albums, reference]);

	return (
		<main aria-label="Confección" className="flex flex-col gap-4 p-6">
			<Making reading={reading} />
			<Link to="/" className="text-primary underline">
				Volver al catálogo
			</Link>
		</main>
	);
}

function Making({ reading }: { reading: Reading }) {
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
		content = <Characteristics album={reading.album} />;
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

function Characteristics({ album }: { album: Album }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<h2 className="text-2xl font-semibold">{album.commercialName}</h2>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
					<dt>Referencia</dt>
					<dd>{album.reference}</dd>
					<dt>Tamaño del álbum</dt>
					<dd>{sizeLabel(album.albumSize)}</dd>
					<dt>Tamaño de página</dt>
					<dd>{sizeLabel(album.pageSize)}</dd>
					<dt>Páginas</dt>
					<dd>{album.pageCount}</dd>
					<dt>Encuadernación</dt>
					<dd>{bindingLabels[album.binding]}</dd>
					<dt>Orientación</dt>
					<dd>{orientationLabels[album.orientation]}</dd>
				</dl>
			</CardContent>
		</Card>
	);
}
