import { describe, expect, test } from "bun:test";
import type { Album } from "@/api/endpoints/Albums";
import { PresentedAlbum } from "@/domain/album/PresentedAlbum";

const portraitAlbum: Album = {
	reference: "PT-150",
	commercialName: "Retrato de bolsillo",
	albumSize: { width: 150, height: 210 },
	pageSize: { width: 140, height: 200 },
	pageCount: 20,
	binding: "softcover",
	orientation: "portrait",
};

describe("PresentedAlbum", () => {
	test("keeps the reference, commercial name and page count", () => {
		const presented = new PresentedAlbum(portraitAlbum);

		expect(presented.reference).toBe("PT-150");
		expect(presented.commercialName).toBe("Retrato de bolsillo");
		expect(presented.pageCount).toBe(20);
	});

	test("labels the binding in Spanish", () => {
		const hardcover = new PresentedAlbum({
			...portraitAlbum,
			binding: "hardcover",
		});
		const softcover = new PresentedAlbum(portraitAlbum);

		expect(hardcover.bindingLabel()).toBe("Tapa dura");
		expect(softcover.bindingLabel()).toBe("Tapa blanda");
	});

	test("labels the orientation in Spanish", () => {
		const square = new PresentedAlbum({
			...portraitAlbum,
			orientation: "square",
		});
		const portrait = new PresentedAlbum(portraitAlbum);
		const landscape = new PresentedAlbum({
			...portraitAlbum,
			orientation: "landscape",
		});

		expect(square.orientationLabel()).toBe("Cuadrado");
		expect(portrait.orientationLabel()).toBe("Vertical");
		expect(landscape.orientationLabel()).toBe("Apaisado");
	});

	test("labels the album and page sizes in millimetres", () => {
		const presented = new PresentedAlbum(portraitAlbum);

		expect(presented.albumSizeLabel()).toBe("150 × 210 mm");
		expect(presented.pageSizeLabel()).toBe("140 × 200 mm");
	});

	test("gives the page size as the proportion of a face", () => {
		const presented = new PresentedAlbum(portraitAlbum);

		expect(presented.pageProportion()).toBe("140 / 200");
	});

	test("tells which photo occupies a face, none when it is empty", () => {
		const presented = new PresentedAlbum({
			...portraitAlbum,
			slots: [
				{ face: 1, photoId: "photo-1" },
				{ face: 2, photoId: null },
			],
		});

		expect(presented.photoIdOf(1)).toBe("photo-1");
		expect(presented.photoIdOf(2)).toBeNull();
	});

	test("tells whether a photo occupies any slot", () => {
		const presented = new PresentedAlbum({
			...portraitAlbum,
			slots: [
				{ face: 1, photoId: "photo-1" },
				{ face: 2, photoId: null },
			],
		});

		expect(presented.hasPlaced("photo-1")).toBe(true);
		expect(presented.hasPlaced("photo-2")).toBe(false);
	});

	test("has no photo placed when it carries no slots", () => {
		const presented = new PresentedAlbum(portraitAlbum);

		expect(presented.photoIdOf(1)).toBeNull();
		expect(presented.hasPlaced("photo-1")).toBe(false);
	});
});
