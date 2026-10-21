import { FaceViewer } from "@/components/making/face/FaceViewer";
import { MakingHeader } from "@/components/making/MakingHeader";
import { PhotoTray } from "@/components/making/photos/PhotoTray";
import { PhotosProvider } from "@/contexts/PhotosContext";
import { useCurrentUserAlbum } from "@/contexts/UserAlbumContext";

export function MakingPage() {
	const { userAlbum } = useCurrentUserAlbum();

	let album = null;
	if (userAlbum !== null) {
		album = (
			<>
				<MakingHeader album={userAlbum} />
				<FaceViewer album={userAlbum} />
			</>
		);
	}
	return (
		<PhotosProvider>
			<main
				aria-label="Confección"
				className="flex h-[calc(100svh-4rem)] gap-4 p-6"
			>
				<div className="w-1/4 min-w-0">
					<PhotoTray />
				</div>
				<div className="flex min-w-0 flex-1 flex-col gap-4">{album}</div>
			</main>
		</PhotosProvider>
	);
}
