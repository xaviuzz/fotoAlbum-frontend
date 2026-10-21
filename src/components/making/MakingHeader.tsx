import { AlbumCharacteristics } from "@/components/making/AlbumCharacteristics";
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
					<AlbumCharacteristics album={album} />
				</HoverCardContent>
			</HoverCard>
		</h2>
	);
}
