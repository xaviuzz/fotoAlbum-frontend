import type { PresentedAlbum } from "@/domain/album/PresentedAlbum";

export function AlbumCharacteristics({ album }: { album: PresentedAlbum }) {
	return (
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
	);
}
