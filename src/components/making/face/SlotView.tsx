import { type DragEvent, useState } from "react";
import { useSlots } from "@/api/ApiContext";
import type { PhotosAnswer } from "@/api/endpoints/Photos";
import { ActionFailure } from "@/components/making/ActionFailure";
import {
	carriesPhoto,
	draggedPhotoId,
	startFaceDrag,
} from "@/components/making/dragging";
import type { FaceNumber } from "@/components/making/face/FaceNumber";
import { useCurrentPhotos } from "@/contexts/PhotosContext";
import { useCurrentUserAlbum } from "@/contexts/UserAlbumContext";
import type { PresentedAlbum } from "@/domain/album/PresentedAlbum";
import type { Reading } from "@/lib/useReading";

const EMPTY_OUTLINE = "outline outline-1 outline-blue-500";

function thumbnailOf(reading: Reading<PhotosAnswer>, photoId: string) {
	let thumbnailUrl = null;
	if (reading !== "loading" && reading.status === "ok") {
		const photo = reading.photos.find((candidate) => candidate.id === photoId);
		if (photo) {
			thumbnailUrl = photo.thumbnailUrl;
		}
	}
	return thumbnailUrl;
}

export function SlotView({
	album,
	face,
}: {
	album: PresentedAlbum;
	face: FaceNumber;
}) {
	const { reading } = useCurrentPhotos();
	const { adopt } = useCurrentUserAlbum();
	const slots = useSlots();
	const [placementFailed, setPlacementFailed] = useState(false);
	const placement = album.slotGeometry().placement();
	const style = {
		left: `${placement.left}%`,
		top: `${placement.top}%`,
		width: `${placement.width}%`,
		height: `${placement.height}%`,
	};
	const photoId = face.occupantIn(album);

	const allowPhotoDrop = (event: DragEvent) => {
		if (carriesPhoto(event)) {
			event.preventDefault();
		}
	};

	const placeDroppedPhoto = async (event: DragEvent) => {
		event.preventDefault();
		const answer = await slots.place(face.value, draggedPhotoId(event));
		setPlacementFailed(answer.status !== "ok");
		if (answer.status === "ok") {
			adopt(answer.userAlbum);
		}
	};

	let outline = EMPTY_OUTLINE;
	let photo = null;
	if (photoId !== null) {
		outline = "";
		const thumbnailUrl = thumbnailOf(reading, photoId);
		if (thumbnailUrl !== null) {
			photo = (
				<img
					src={thumbnailUrl}
					alt={face.describePhoto()}
					onDragStart={(event) => startFaceDrag(event, face.value)}
					className="size-full object-contain"
				/>
			);
		}
	}

	return (
		<>
			<figure
				aria-label={face.describeSlot()}
				style={style}
				onDragOver={allowPhotoDrop}
				onDrop={placeDroppedPhoto}
				className={`absolute ${outline}`}
			>
				{photo}
			</figure>
			<div className="absolute inset-x-2 bottom-2">
				<ActionFailure
					failed={placementFailed}
					message="No se pudo colocar la foto"
				/>
			</div>
		</>
	);
}
