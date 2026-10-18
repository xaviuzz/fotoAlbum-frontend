import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import {
	Catalogue,
	type CatalogueReading,
} from "@/components/catalogue/Catalogue";
import { PresentedAlbum } from "@/lib/PresentedAlbum";
import { FreshSession } from "../../support/FreshSession";

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
});

class SUT {
	show(reading: CatalogueReading) {
		render(
			<FreshSession>
				<MemoryRouter>
					<Catalogue reading={reading} />
				</MemoryRouter>
			</FreshSession>,
		);
	}

	loading() {
		return screen.getByRole("status", { name: "Cargando álbumes" });
	}

	cards() {
		return screen.queryAllByRole("link");
	}

	emptyMessage() {
		return screen.getByText("El catálogo está vacío");
	}

	errorMessage() {
		return screen.getByRole("alert");
	}
}
