import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "@/App";
import { ApiProvider } from "@/api/ApiContext";

describe("App", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows the header", () => {
		sut.showAt("/");

		expect(sut.banner()).toBeInTheDocument();
	});

	test("shows the home page at the root", () => {
		sut.showAt("/");

		expect(sut.catalogue()).toBeInTheDocument();
	});

	test("shows the making page at a making path", () => {
		sut.showAt("/confeccion/SQ-210");

		expect(sut.catalogue()).not.toBeInTheDocument();
		expect(sut.making()).toBeInTheDocument();
	});
});

class SUT {
	showAt(path: string) {
		render(
			<ApiProvider
				baseUrl="http://localhost"
				fetch={() => new Promise(() => {})}
			>
				<MemoryRouter initialEntries={[path]}>
					<App />
				</MemoryRouter>
			</ApiProvider>,
		);
	}

	banner() {
		return screen.getByRole("banner");
	}

	catalogue() {
		return screen.queryByRole("main", { name: "Catálogo" });
	}

	making() {
		return screen.queryByRole("main", { name: "Confección" });
	}
}
