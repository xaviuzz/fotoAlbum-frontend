import type { Photo } from "@/api/endpoints/Photos";

export function PhotoThumbnails({ photos }: { photos: Photo[] }) {
	const items = [];
	for (const [index, photo] of photos.entries()) {
		items.push(
			<li key={photo.id}>
				<img
					src={photo.thumbnailUrl}
					alt={`Foto ${index + 1}`}
					className="w-full rounded-md"
				/>
			</li>,
		);
	}
	return <ul className="flex flex-col gap-2">{items}</ul>;
}
