import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "@/App";
import { ApiProvider } from "@/api/ApiContext";
import { Session } from "@/lib/Session";
import { SessionStore } from "@/lib/SessionStore";
import { SessionProvider } from "@/session/SessionContext";
import { FakeStorage } from "./support/FakeStorage";

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

	test("shows the making page of the chosen album", () => {
		sut.choose("SQ-210");

		sut.showAt("/confeccion/SQ-210");

		expect(sut.catalogue()).not.toBeInTheDocument();
		expect(sut.making()).toBeInTheDocument();
	});

	test("shows the catalogue at a making path when nothing is chosen", () => {
		sut.showAt("/confeccion/SQ-210");

		expect(sut.catalogue()).toBeInTheDocument();
		expect(sut.making()).not.toBeInTheDocument();
	});
});

class SUT {
	private readonly store = new SessionStore(new FakeStorage());

	choose(reference: string) {
		this.store.save(Session.start().choosing(reference));
	}

	showAt(path: string) {
		render(
			<ApiProvider
				baseUrl="http://localhost"
				fetch={() => new Promise(() => {})}
			>
				<SessionProvider store={this.store}>
					<MemoryRouter initialEntries={[path]}>
						<App />
					</MemoryRouter>
				</SessionProvider>
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
