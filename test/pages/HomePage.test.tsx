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

	test("shows one card per album of the catalogue", async () => {
		sut.answerAlbums(albums);

		sut.show();

		const cards = await sut.cards();
		expect(cards).toHaveLength(2);
		expect(cards[0]).toHaveTextContent("Cuadrado clásico");
		expect(cards[1]).toHaveTextContent("Retrato de bolsillo");
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

	cards() {
		return screen.findAllByRole("link");
	}
}
