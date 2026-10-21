import type { PresentedAlbum } from "@/domain/album/PresentedAlbum";

export type BindingSide = "left" | "right";

export class FaceNumber {
	private readonly number: number;
	private readonly pageCount: number;

	get value() {
		return this.number;
	}

	private constructor(number: number, pageCount: number) {
		this.number = number;
		this.pageCount = pageCount;
	}

	static first(pageCount: number) {
		return new FaceNumber(1, pageCount);
	}

	next() {
		let face: FaceNumber = this;
		if (!this.isLast()) {
			face = new FaceNumber(this.number + 1, this.pageCount);
		}
		return face;
	}

	previous() {
		let face: FaceNumber = this;
		if (!this.isFirst()) {
			face = new FaceNumber(this.number - 1, this.pageCount);
		}
		return face;
	}

	isFirst() {
		return this.number === 1;
	}

	isLast() {
		return this.number === this.pageCount;
	}

	bindingSide(): BindingSide {
		let side: BindingSide = "left";
		if (this.number % 2 === 0) {
			side = "right";
		}
		return side;
	}

	label() {
		return `${this.number}/${this.pageCount}`;
	}

	occupantIn(album: PresentedAlbum) {
		return album.photoIdOf(this.number);
	}

	describe() {
		return `Cara ${this.number}`;
	}

	describeSlot() {
		return `Hueco de la cara ${this.number}`;
	}

	describePhoto() {
		return `Foto de la cara ${this.number}`;
	}
}
