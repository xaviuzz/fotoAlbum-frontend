import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { AlbumCharacteristics } from "@/components/making/AlbumCharacteristics";
import { PresentedAlbum } from "@/lib/PresentedAlbum";

const album = new PresentedAlbum({
	reference: "PT-150",
	commercialName: "Retrato de bolsillo",
	albumSize: { width: 150, height: 210 },
	pageSize: { width: 140, height: 200 },
	pageCount: 20,
	binding: "softcover",
	orientation: "portrait",
});

describe("AlbumCharacteristics", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows the commercial name as heading", () => {
		sut.show(album);

		expect(sut.heading("Retrato de bolsillo")).toBeInTheDocument();
	});

	test("shows the characteristics of the album", () => {
		sut.show(album);

		const card = sut.card();
		expect(card).toHaveTextContent("PT-150");
		expect(card).toHaveTextContent("150 × 210 mm");
		expect(card).toHaveTextContent("140 × 200 mm");
		expect(card).toHaveTextContent("20");
		expect(card).toHaveTextContent("Tapa blanda");
		expect(card).toHaveTextContent("Vertical");
	});
});

class SUT {
	private container: HTMLElement | undefined;

	show(album: PresentedAlbum) {
		this.container = render(<AlbumCharacteristics album={album} />).container;
	}

	heading(name: string) {
		return screen.getByRole("heading", { name });
	}

	card() {
		return this.container as HTMLElement;
	}
}
