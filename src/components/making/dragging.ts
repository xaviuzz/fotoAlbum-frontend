import type { DragEvent } from "react";

const PHOTO_TYPE = "application/x-fotoalbum-photo";

export function startPhotoDrag(event: DragEvent, photoId: string) {
	event.dataTransfer.setData(PHOTO_TYPE, photoId);
	event.dataTransfer.effectAllowed = "move";
}

export function carriesPhoto(event: DragEvent) {
	return event.dataTransfer.types.includes(PHOTO_TYPE);
}

export function draggedPhotoId(event: DragEvent) {
	return event.dataTransfer.getData(PHOTO_TYPE);
}

const FACE_TYPE = "application/x-fotoalbum-face";

export function startFaceDrag(event: DragEvent, face: number) {
	event.dataTransfer.setData(FACE_TYPE, String(face));
	event.dataTransfer.effectAllowed = "move";
}

export function carriesFace(event: DragEvent) {
	return event.dataTransfer.types.includes(FACE_TYPE);
}

export function draggedFace(event: DragEvent) {
	return Number(event.dataTransfer.getData(FACE_TYPE));
}
