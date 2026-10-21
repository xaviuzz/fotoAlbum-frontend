import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ApiProvider } from "@/api/ApiContext";
import { UserAlbumContext } from "@/contexts/UserAlbumContext";
import { PresentedAlbum } from "@/lib/PresentedAlbum";
import { MakingPage } from "@/pages/MakingPage";
import { FreshSession } from "../support/FreshSession";

const userAlbum = new PresentedAlbum({
	reference: "PT-150",
	commercialName: "Retrato de bolsillo",
	albumSize: { width: 150, height: 210 },
	pageSize: { width: 140, height: 200 },
	pageCount: 20,
	binding: "softcover",
	orientation: "portrait",
});

describe("MakingPage", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows the commercial name of the user album as heading", () => {
		sut.show();

		expect(sut.heading("Retrato de bolsillo")).toBeInTheDocument();
	});

	test("shows the first face of the user album", () => {
		sut.show();

		expect(sut.face()).toHaveAccessibleName("Cara 1");
		expect(sut.position()).toHaveTextContent("1/20");
	});

	test("shows the photo tray beside the user album", () => {
		sut.show();

		expect(sut.photoTray()).toBeInTheDocument();
	});

	test("does not ask the catalogue for the album", () => {
		sut.show();

		expect(sut.pathsAsked()).not.toContain("/album.get");
	});

	test("offers no link back to the catalogue", () => {
		sut.show();

		expect(sut.links()).toHaveLength(0);
	});
});

class SUT {
	private readonly paths: string[] = [];

	show() {
		const fetch = (request: Request) => {
			this.paths.push(new URL(request.url).pathname);
			return new Promise<Response>(() => {});
		};
		render(
			<FreshSession>
				<ApiProvider baseUrl="http://localhost" fetch={fetch}>
					<MemoryRouter initialEntries={["/confeccion"]}>
						<UserAlbumContext.Provider value={{ userAlbum, adopt: () => {} }}>
							<MakingPage />
						</UserAlbumContext.Provider>
					</MemoryRouter>
				</ApiProvider>
			</FreshSession>,
		);
	}

	heading(name: string) {
		return screen.getByRole("heading", { name });
	}

	face() {
		return screen.getByRole("img", { name: "Cara 1" });
	}

	position() {
		return screen.getByRole("status", { name: "Posición" });
	}

	photoTray() {
		return screen.getByRole("complementary", { name: "Mis fotos" });
	}

	links() {
		return screen.queryAllByRole("link");
	}

	pathsAsked() {
		return this.paths;
	}
}
