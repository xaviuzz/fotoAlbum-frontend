import { Button } from "@/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { PresentedAlbum } from "@/domain/album/PresentedAlbum";

export function MakingHeader({ album }: { album: PresentedAlbum }) {
	return (
		<h2 className="text-2xl font-semibold">
			<HoverCard openDelay={200}>
				<HoverCardTrigger asChild>
					<Button variant="link" className="text-2xl font-semibold">
						{album.commercialName}
					</Button>
				</HoverCardTrigger>
				<HoverCardContent className="w-auto" align="start">
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
				</HoverCardContent>
			</HoverCard>
		</h2>
	);
}
