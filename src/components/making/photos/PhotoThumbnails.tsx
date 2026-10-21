import type { Photo } from "@/api/endpoints/Photos";
import { startPhotoDrag } from "@/components/making/dragging";

export function PhotoThumbnails({ photos }: { photos: Photo[] }) {
	const items = [];
	for (const [index, photo] of photos.entries()) {
		items.push(
			<li key={photo.id}>
				<img
					src={photo.thumbnailUrl}
					alt={`Foto ${index + 1}`}
					onDragStart={(event) => startPhotoDrag(event, photo.id)}
					className="w-full rounded-md"
				/>
			</li>,
		);
	}
	return <ul className="flex flex-col gap-2">{items}</ul>;
}
