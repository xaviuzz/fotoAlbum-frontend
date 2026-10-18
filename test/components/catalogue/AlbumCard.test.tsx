import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AlbumCard } from "@/components/catalogue/AlbumCard";
import { PresentedAlbum } from "@/lib/PresentedAlbum";

const portraitAlbum = new PresentedAlbum({
	reference: "PT-150",
	commercialName: "Retrato de bolsillo",
	albumSize: { width: 150, height: 210 },
	pageSize: { width: 140, height: 200 },
	pageCount: 20,
	binding: "softcover",
	orientation: "portrait",
});

describe("AlbumCard", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("is one link to the making page of the album", () => {
		sut.show(portraitAlbum);

		expect(sut.link()).toHaveAttribute("href", "/confeccion/PT-150");
	});

	test("shows the commercial name, size, page count and binding", () => {
		sut.show(portraitAlbum);

		expect(sut.link()).toHaveTextContent("Retrato de bolsillo");
		expect(sut.link()).toHaveTextContent("150 × 210 mm");
		expect(sut.link()).toHaveTextContent("20 páginas");
		expect(sut.link()).toHaveTextContent("Tapa blanda");
	});
});

class SUT {
	show(album: PresentedAlbum) {
		render(
			<MemoryRouter>
				<AlbumCard album={album} />
			</MemoryRouter>,
		);
	}

	link() {
		return screen.getByRole("link");
	}
}
