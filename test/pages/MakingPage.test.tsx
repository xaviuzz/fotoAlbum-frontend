import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { ApiProvider } from "@/api/ApiContext";
import { MakingPage } from "@/pages/MakingPage";

const album = {
	reference: "PT-150",
	commercialName: "Retrato de bolsillo",
	albumSize: { width: 150, height: 210 },
	pageSize: { width: 140, height: 200 },
	pageCount: 20,
	binding: "softcover",
	orientation: "portrait",
};

describe("MakingPage", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows a quiet loading message while the album is pending", () => {
		sut.show("PT-150");

		expect(sut.loading()).toBeInTheDocument();
	});

	test("shows the commercial name as heading", async () => {
		sut.answerAlbum();

		sut.show("PT-150");

		expect(await sut.heading("Retrato de bolsillo")).toBeInTheDocument();
	});

	test("shows the characteristics of the album", async () => {
		sut.answerAlbum();

		sut.show("PT-150");

		const page = await sut.page();
		expect(page).toHaveTextContent("PT-150");
		expect(page).toHaveTextContent("150 × 210 mm");
		expect(page).toHaveTextContent("140 × 200 mm");
		expect(page).toHaveTextContent("20");
		expect(page).toHaveTextContent("Tapa blanda");
		expect(page).toHaveTextContent("Vertical");
	});

	test("asks for the album of the reference in the path", async () => {
		sut.answerAlbum();

		sut.show("PT-150");
		await sut.page();

		expect(sut.referenceAsked()).toBe("PT-150");
	});

	test("links back to the catalogue", async () => {
		sut.answerAlbum();

		sut.show("PT-150");

		expect(await sut.backLink()).toHaveAttribute("href", "/");
	});

	test("says the album was not found", async () => {
		sut.answerNotFound();

		sut.show("NOPE");

		expect(await sut.notFound()).toBeInTheDocument();
	});

	test("shows an error message when the call fails", async () => {
		sut.fail();

		sut.show("PT-150");

		expect(await sut.errorMessage()).toBeInTheDocument();
	});
});

class SUT {
	private answer: () => Promise<Response> = () => new Promise(() => {});
	private asked: string | undefined;

	answerAlbum() {
		this.answer = async () => okReply({ album });
	}

	answerNotFound() {
		this.answer = async () =>
			new Response(
				JSON.stringify({
					header: { callId: "c", status: "error" },
					body: { code: "ALBUM_NOT_FOUND", message: "no such album" },
				}),
				{ headers: { "content-type": "application/json" } },
			);
	}

	fail() {
		this.answer = async () => {
			throw new TypeError("network down");
		};
	}

	show(reference: string) {
		const fetch = async (request: Request) => {
			const call = await request.json();
			this.asked = call.body.reference;
			return this.answer();
		};
		render(
			<ApiProvider baseUrl="http://localhost" fetch={fetch}>
				<MemoryRouter initialEntries={[`/confeccion/${reference}`]}>
					<Routes>
						<Route path="/confeccion/:reference" element={<MakingPage />} />
					</Routes>
				</MemoryRouter>
			</ApiProvider>,
		);
	}

	loading() {
		return screen.getByRole("status", { name: "Cargando álbum" });
	}

	heading(name: string) {
		return screen.findByRole("heading", { name });
	}

	page() {
		return screen.findByRole("main", { name: "Confección" });
	}

	backLink() {
		return screen.findByRole("link", { name: "Volver al catálogo" });
	}

	notFound() {
		return screen.findByText("Álbum no encontrado");
	}

	errorMessage() {
		return screen.findByRole("alert");
	}

	referenceAsked() {
		return this.asked;
	}
}

function okReply(body: unknown) {
	return new Response(
		JSON.stringify({ header: { callId: "c", status: "ok" }, body }),
		{ headers: { "content-type": "application/json" } },
	);
}
