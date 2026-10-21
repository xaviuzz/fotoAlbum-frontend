import type { Album } from "@/api/endpoints/Albums";
import type { Photo } from "@/api/endpoints/Photos";
import type { components } from "@/api/schema";
import { SlotGeometry } from "@/domain/album/SlotGeometry";

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

	constructor(album: Album & { slots?: Slot[] }) {
		this.album = album;
		this.slots = [];
		if (album.slots) {
			this.slots = album.slots;
		}
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

	slotGeometry() {
		return SlotGeometry.of(this.album.pageSize);
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

	unplaced(photos: Photo[]) {
		const unplaced = [];
		for (const photo of photos) {
			if (!this.hasPlaced(photo.id)) {
				unplaced.push(photo);
			}
		}
		return unplaced;
	}

	private sizeLabel(size: Album["albumSize"]) {
		return `${size.width} × ${size.height} mm`;
	}
}
