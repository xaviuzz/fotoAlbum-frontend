import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	Catalogue,
	type CatalogueReading,
} from "@/components/catalogue/Catalogue";
import { PresentedAlbum } from "@/lib/PresentedAlbum";
import { UserAlbumHost } from "../../support/UserAlbumHost";

const album = new PresentedAlbum({
	reference: "PT-150",
	commercialName: "Retrato de bolsillo",
	albumSize: { width: 150, height: 210 },
	pageSize: { width: 140, height: 200 },
	pageCount: 20,
	binding: "softcover",
	orientation: "portrait",
});

describe("Catalogue", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows a quiet loading message while the catalogue is pending", () => {
		sut.show("loading");

		expect(sut.loading()).toBeInTheDocument();
	});

	test("shows a card for each album of the answer", () => {
		sut.show({ status: "ok", albums: [album] });

		expect(sut.cards()).toHaveLength(1);
	});

	test("shows an empty message when the catalogue has no albums", () => {
		sut.show({ status: "ok", albums: [] });

		expect(sut.emptyMessage()).toBeInTheDocument();
	});

	test("shows an error message when the answer is an error", () => {
		sut.show({ status: "error", code: "INTERNAL_ERROR" });

		expect(sut.errorMessage()).toBeInTheDocument();
	});

	test("shows no alert while every card can still be pressed", () => {
		sut.show({ status: "ok", albums: [album] });

		expect(sut.alerts()).toHaveLength(0);
	});

	test("shows an alert and keeps the cards when a user album cannot be created", async () => {
		sut.show({ status: "ok", albums: [album] });

		await sut.pressCard();

		expect(await sut.creationAlert()).toHaveTextContent(
			"No se pudo crear el álbum",
		);
		expect(sut.cards()).toHaveLength(1);
	});
});

class SUT {
	show(reading: CatalogueReading) {
		render(
			<UserAlbumHost fetch={refusal}>
				<Catalogue reading={reading} />
			</UserAlbumHost>,
		);
	}

	loading() {
		return screen.getByRole("status", { name: "Cargando álbumes" });
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

	emptyMessage() {
		return screen.getByText("El catálogo está vacío");
	}

	errorMessage() {
		return screen.getByRole("alert");
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
