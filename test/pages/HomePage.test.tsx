import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ApiProvider } from "@/api/ApiContext";
import { HomePage } from "@/pages/HomePage";

const albums = [
	{
		reference: "SQ-210",
		commercialName: "Cuadrado clásico",
		albumSize: { width: 210, height: 210 },
		pageSize: { width: 200, height: 200 },
		pageCount: 24,
		binding: "hardcover",
		orientation: "square",
	},
	{
		reference: "PT-150",
		commercialName: "Retrato de bolsillo",
		albumSize: { width: 150, height: 210 },
		pageSize: { width: 140, height: 200 },
		pageCount: 20,
		binding: "softcover",
		orientation: "portrait",
	},
];

describe("HomePage", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("invites to choose an album", () => {
		sut.show();

		expect(sut.title()).toBeInTheDocument();
	});

	test("shows a quiet loading message while the catalogue is pending", () => {
		sut.show();

		expect(sut.loading()).toBeInTheDocument();
	});

	test("shows one card per album of the catalogue", async () => {
		sut.answerAlbums(albums);

		sut.show();

		const cards = await sut.cards();
		expect(cards).toHaveLength(2);
		expect(cards[0]).toHaveTextContent("Cuadrado clásico");
		expect(cards[1]).toHaveTextContent("Retrato de bolsillo");
	});

	test("shows an empty message when the catalogue has no albums", async () => {
		sut.answerAlbums([]);

		sut.show();

		expect(await sut.emptyMessage()).toBeInTheDocument();
	});

	test("shows an error message when the call fails", async () => {
		sut.fail();

		sut.show();

		expect(await sut.errorMessage()).toBeInTheDocument();
	});
});

class SUT {
	private answer: () => Promise<Response> = () => new Promise(() => {});

	answerAlbums(answered: unknown[]) {
		this.answer = async () =>
			new Response(
				JSON.stringify({
					header: { callId: "c", status: "ok" },
					body: { albums: answered },
				}),
				{ headers: { "content-type": "application/json" } },
			);
	}

	fail() {
		this.answer = async () => {
			throw new TypeError("network down");
		};
	}

	show() {
		render(
			<ApiProvider baseUrl="http://localhost" fetch={() => this.answer()}>
				<MemoryRouter>
					<HomePage />
				</MemoryRouter>
			</ApiProvider>,
		);
	}

	title() {
		return screen.getByRole("heading", { name: "Elige un álbum" });
	}

	loading() {
		return screen.getByRole("status", { name: "Cargando álbumes" });
	}

	cards() {
		return screen.findAllByRole("link");
	}

	emptyMessage() {
		return screen.findByText("El catálogo está vacío");
	}

	errorMessage() {
		return screen.findByRole("alert");
	}
}
