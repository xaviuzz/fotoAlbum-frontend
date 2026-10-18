import { describe, expect, test } from "bun:test";
import type { Album } from "@/api/Albums";
import { PresentedAlbum } from "@/lib/PresentedAlbum";

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
});
