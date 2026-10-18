import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AlbumRow } from "@/components/catalogue/AlbumRow";
import { PresentedAlbum } from "@/lib/PresentedAlbum";
import { FreshSession } from "../../support/FreshSession";

const squareAlbum = new PresentedAlbum({
	reference: "SQ-210",
	commercialName: "Cuadrado clásico",
	albumSize: { width: 210, height: 210 },
	pageSize: { width: 200, height: 200 },
	pageCount: 24,
	binding: "hardcover",
	orientation: "square",
});

const portraitAlbum = new PresentedAlbum({
	reference: "PT-150",
	commercialName: "Retrato de bolsillo",
	albumSize: { width: 150, height: 210 },
	pageSize: { width: 140, height: 200 },
	pageCount: 20,
	binding: "softcover",
	orientation: "portrait",
});

describe("AlbumRow", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows one card per album, in order", () => {
		sut.show([squareAlbum, portraitAlbum]);

		const cards = sut.cards();
		expect(cards).toHaveLength(2);
		expect(cards[0]).toHaveTextContent("Cuadrado clásico");
		expect(cards[1]).toHaveTextContent("Retrato de bolsillo");
	});

	test("shows no card when there are no albums", () => {
		sut.show([]);

		expect(sut.cards()).toHaveLength(0);
	});
});

class SUT {
	show(albums: PresentedAlbum[]) {
		render(
			<FreshSession>
				<MemoryRouter>
					<AlbumRow albums={albums} />
				</MemoryRouter>
			</FreshSession>,
		);
	}

	cards() {
		return screen.queryAllByRole("link");
	}
}
