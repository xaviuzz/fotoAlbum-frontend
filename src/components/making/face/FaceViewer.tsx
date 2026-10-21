import { useState } from "react";
import { FaceNavigation } from "@/components/making/face/FaceNavigation";
import { FaceNumber } from "@/components/making/face/FaceNumber";
import { FaceView } from "@/components/making/face/FaceView";
import type { PresentedAlbum } from "@/domain/album/PresentedAlbum";

export function FaceViewer({ album }: { album: PresentedAlbum }) {
	const [face, setFace] = useState(() => FaceNumber.first(album.pageCount));

	return (
		<div className="flex min-h-0 flex-1 flex-col items-center gap-4">
			<FaceView face={face} proportion={album.pageProportion()} />
			<FaceNavigation face={face} onChange={setFace} />
		</div>
	);
}
