import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PresentedAlbum } from "@/lib/PresentedAlbum";

export function AlbumCharacteristics({ album }: { album: PresentedAlbum }) {
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
					<dd>{album.albumSizeLabel()}</dd>
					<dt>Tamaño de página</dt>
					<dd>{album.pageSizeLabel()}</dd>
					<dt>Páginas</dt>
					<dd>{album.pageCount}</dd>
					<dt>Encuadernación</dt>
					<dd>{album.bindingLabel()}</dd>
					<dt>Orientación</dt>
					<dd>{album.orientationLabel()}</dd>
				</dl>
			</CardContent>
		</Card>
	);
}
