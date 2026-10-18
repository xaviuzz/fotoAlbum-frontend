import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PresentedAlbum } from "@/lib/PresentedAlbum";

export function AlbumCard({ album }: { album: PresentedAlbum }) {
	return (
		<Link to={`/confeccion/${album.reference}`} className="w-full">
			<Card className="h-full">
				<CardHeader>
					<CardTitle>{album.commercialName}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col">
					<span>{album.albumSizeLabel()}</span>
					<span>{album.pageCount} páginas</span>
					<span>{album.bindingLabel()}</span>
				</CardContent>
			</Card>
		</Link>
	);
}
