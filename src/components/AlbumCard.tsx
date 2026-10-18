import { Link } from "react-router";
import type { Album } from "@/api/Albums";
import { bindingLabels, sizeLabel } from "@/components/albumLabels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AlbumCard({ album }: { album: Album }) {
	return (
		<Link to={`/confeccion/${album.reference}`} className="w-64 shrink-0">
			<Card className="h-full">
				<CardHeader>
					<CardTitle>{album.commercialName}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col">
					<span>{sizeLabel(album.albumSize)}</span>
					<span>{album.pageCount} páginas</span>
					<span>{bindingLabels[album.binding]}</span>
				</CardContent>
			</Card>
		</Link>
	);
}
