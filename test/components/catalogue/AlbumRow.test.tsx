import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlbumRow } from "@/components/catalogue/AlbumRow";
import { PresentedAlbum } from "@/domain/album/PresentedAlbum";
import { UserAlbumHost } from "../../support/UserAlbumHost";

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

	test("shows no alert while every card can still be pressed", () => {
		sut.show([portraitAlbum]);

		expect(sut.alerts()).toHaveLength(0);
	});

	test("shows an alert and keeps the cards when a user album cannot be created", async () => {
		sut.show([portraitAlbum]);

		await sut.pressCard();

		expect(await sut.creationAlert()).toHaveTextContent(
			"No se pudo crear el álbum",
		);
		expect(sut.cards()).toHaveLength(1);
	});
});

class SUT {
	show(albums: PresentedAlbum[]) {
		render(
			<UserAlbumHost fetch={refusal}>
				<AlbumRow albums={albums} />
			</UserAlbumHost>,
		);
	}

	cards() {
		return screen.queryAllByRole("button");
	}

	pressCard() {
		return userEvent.click(this.cards()[0]);
	}

	alerts() {
		return screen.queryAllByRole("alert");
	}

	creationAlert() {
		return screen.findByRole("alert");
	}
}

async function refusal(request: Request) {
	const call = await request.json();
	return new Response(
		JSON.stringify({
			header: { callId: call.header.callId, status: "error" },
			body: { code: "INTERNAL_ERROR", message: "failed" },
		}),
		{ headers: { "content-type": "application/json" } },
	);
}
