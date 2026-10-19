import type { Album } from "@/api/Albums";

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

	constructor(album: Album) {
		this.album = album;
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

	private sizeLabel(size: Album["albumSize"]) {
		return `${size.width} × ${size.height} mm`;
	}
}
