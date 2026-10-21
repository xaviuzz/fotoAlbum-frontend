import type { Album } from "@/api/endpoints/Albums";
import type { components } from "@/api/schema";

type Slot = components["schemas"]["Slot"];

const bindingLabels: Record<Album["binding"], string> = {
	hardcover: "Tapa dura",
	softcover: "Tapa blanda",
};

const orientationLabels: Record<Album["orientation"], string> = {
	square: "Cuadrado",
	portrait: "Vertical",
	landscape: "Apaisado",
};

export class PresentedAlbum {
	private readonly album: Album;
	private readonly slots: Slot[];

	constructor(album: Album, slots: Slot[] = []) {
		this.album = album;
		this.slots = slots;
	}

	get reference() {
		return this.album.reference;
	}

	get commercialName() {
		return this.album.commercialName;
	}

	get pageCount() {
		return this.album.pageCount;
	}

	bindingLabel() {
		return bindingLabels[this.album.binding];
	}

	orientationLabel() {
		return orientationLabels[this.album.orientation];
	}

	albumSizeLabel() {
		return this.sizeLabel(this.album.albumSize);
	}

	pageSizeLabel() {
		return this.sizeLabel(this.album.pageSize);
	}

	pageProportion() {
		const { width, height } = this.album.pageSize;
		return `${width} / ${height}`;
	}

	photoIdOf(face: number) {
		const slot = this.slots.find((candidate) => candidate.face === face);
		let photoId = null;
		if (slot) {
			photoId = slot.photoId;
		}
		return photoId;
	}

	hasPlaced(photoId: string) {
		return this.slots.some((slot) => slot.photoId === photoId);
	}

	private sizeLabel(size: Album["albumSize"]) {
		return `${size.width} × ${size.height} mm`;
	}
}
