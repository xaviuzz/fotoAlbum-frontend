import { type DragEvent, useState } from "react";
import { usePhotos, useSlots } from "@/api/ApiContext";
import type { PhotosAnswer } from "@/api/endpoints/Photos";
import { EmptyNotice } from "@/components/EmptyNotice";
import { FailureNotice } from "@/components/FailureNotice";
import { LoadingNotice } from "@/components/LoadingNotice";
import { ActionFailure } from "@/components/making/ActionFailure";
import { carriesFace, draggedFace } from "@/components/making/dragging";
import { PhotoThumbnails } from "@/components/making/photos/PhotoThumbnails";
import { RejectedFiles } from "@/components/making/photos/RejectedFiles";
import { UploadButton } from "@/components/making/photos/UploadButton";
import { UploadFailure } from "@/components/making/photos/UploadFailure";
import { useUpload } from "@/components/making/photos/useUpload";
import { ReadingView } from "@/components/ReadingView";
import { useCurrentPhotos } from "@/contexts/PhotosContext";
import { useCurrentUserAlbum } from "@/contexts/UserAlbumContext";
import type { PresentedAlbum } from "@/domain/album/PresentedAlbum";
import type { Reading } from "@/lib/useReading";

type ListedPhotos = Extract<PhotosAnswer, { status: "ok" }>;

const hasNoPhotos = (ok: ListedPhotos) => ok.photos.length === 0;
const showPhotos = (ok: ListedPhotos) => <PhotoThumbnails photos={ok.photos} />;

function withoutPlaced(
	reading: Reading<PhotosAnswer>,
	album: PresentedAlbum | null,
): Reading<PhotosAnswer> {
	let visible = reading;
	if (album !== null && reading !== "loading" && reading.status === "ok") {
		visible = { status: "ok", photos: album.unplaced(reading.photos) };
	}
	return visible;
}

export function PhotoTray() {
	const photos = usePhotos();
	const { reading, setReading } = useCurrentPhotos();
	const { userAlbum, adopt } = useCurrentUserAlbum();
	const slots = useSlots();
	const [emptyingFailed, setEmptyingFailed] = useState(false);

	const allowSlotPhotoDrop = (event: DragEvent) => {
		if (carriesFace(event)) {
			event.preventDefault();
		}
	};

	const emptyDroppedSlot = async (event: DragEvent) => {
		event.preventDefault();
		const answer = await slots.empty(draggedFace(event));
		setEmptyingFailed(answer.status !== "ok");
		if (answer.status === "ok") {
			adopt(answer.userAlbum);
		}
	};
	const { uploading, uploadFailed, rejected, upload } = useUpload(
		photos,
		setReading,
	);

	return (
		<aside
			aria-label="Mis fotos"
			onDragOver={allowSlotPhotoDrop}
			onDrop={emptyDroppedSlot}
			className="flex h-full min-h-0 flex-col gap-3"
		>
			<h2 className="text-lg font-semibold">Mis fotos</h2>
			<div className="min-h-0 flex-1 overflow-y-auto">
				<ReadingView
					reading={withoutPlaced(reading, userAlbum)}
					loading={<LoadingNotice label="Cargando fotos" />}
					failed={<FailureNotice message="No se pudieron cargar las fotos" />}
					empty={<EmptyNotice message="Aún no hay fotos" />}
					isEmpty={hasNoPhotos}
					loaded={showPhotos}
				/>
			</div>
			<ActionFailure
				failed={emptyingFailed}
				message="No se pudo vaciar el hueco"
			/>
			<RejectedFiles rejected={rejected} />
			<UploadFailure failed={uploadFailed} />
			<UploadButton uploading={uploading} onChosen={upload} />
		</aside>
	);
}
