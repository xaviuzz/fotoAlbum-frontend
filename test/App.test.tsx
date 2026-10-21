import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { App } from "@/App";
import { ApiProvider } from "@/api/ApiContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { Session } from "@/domain/session/Session";
import { SessionStore } from "@/domain/session/SessionStore";
import { FakeStorage } from "./support/FakeStorage";

const userAlbum = {
	id: "0190-user-album",
	reference: "SQ-210",
	commercialName: "Cuadrado clásico",
	albumSize: { width: 210, height: 210 },
	pageSize: { width: 200, height: 200 },
	pageCount: 24,
	binding: "hardcover",
	orientation: "square",
};

describe("App", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows the header", () => {
		sut.leaveUnanswered();

		sut.showAt("/");

		expect(sut.banner()).toBeInTheDocument();
	});

	test("shows the home page at the root when the session has no user album", async () => {
		sut.showAt("/");

		expect(await sut.findCatalogue()).toBeInTheDocument();
	});

	test("shows the making page when the session has a user album", async () => {
		sut.ownsAnAlbum();

		sut.showAt("/confeccion");

		expect(await sut.findMaking()).toBeInTheDocument();
		expect(sut.catalogue()).not.toBeInTheDocument();
	});

	test("shows the making page at an old address when the session has a user album", async () => {
		sut.ownsAnAlbum();

		sut.showAt("/confeccion/PT-150");

		expect(await sut.findMaking()).toBeInTheDocument();
	});

	test("shows the making page after a card creates the user album", async () => {
		sut.showAt("/");

		await sut.pressCard("Cuadrado clásico");

		expect(await sut.findMaking()).toBeInTheDocument();
		expect(sut.catalogue()).not.toBeInTheDocument();
	});

	test("shows the catalogue at a making path when the session has no user album", async () => {
		sut.showAt("/confeccion");

		expect(await sut.findCatalogue()).toBeInTheDocument();
		expect(sut.making()).not.toBeInTheDocument();
	});
});

class SUT {
	private readonly session = Session.start();
	private readonly store = new SessionStore(new FakeStorage());
	private hasAlbum = false;
	private isAnswering = true;

	constructor() {
		this.store.save(this.session);
	}

	leaveUnanswered() {
		this.isAnswering = false;
	}

	ownsAnAlbum() {
		this.hasAlbum = true;
	}

	showAt(path: string) {
		const fetch = async (request: Request) => {
			let answer = new Promise<Response>(() => {});
			if (this.isAnswering) {
				answer = Promise.resolve(this.replyTo(request.url));
			}
			return answer;
		};
		render(
			<SessionProvider store={this.store}>
				<ApiProvider baseUrl="http://localhost" fetch={fetch}>
					<MemoryRouter initialEntries={[path]}>
						<App />
					</MemoryRouter>
				</ApiProvider>
			</SessionProvider>,
		);
	}

	banner() {
		return screen.getByRole("banner");
	}

	findCatalogue() {
		return screen.findByRole("main", { name: "Catálogo" });
	}

	findMaking() {
		return screen.findByRole("main", { name: "Confección" });
	}

	catalogue() {
		return screen.queryByRole("main", { name: "Catálogo" });
	}

	making() {
		return screen.queryByRole("main", { name: "Confección" });
	}

	async pressCard(name: string) {
		return userEvent.click(
			await screen.findByRole("button", { name: new RegExp(name) }),
		);
	}

	private replyTo(url: string) {
		let body: unknown = { code: "USER_ALBUM_NOT_FOUND", message: "none" };
		let status = "error";
		if (url.endsWith("/album.list")) {
			body = { albums: [userAlbum] };
			status = "ok";
		}
		if (url.endsWith("/userAlbum.create")) {
			body = { userAlbum };
			status = "ok";
		}
		if (url.endsWith("/userAlbum.get") && this.hasAlbum) {
			body = { userAlbum };
			status = "ok";
		}
		return new Response(
			JSON.stringify({ header: { callId: "c", status }, body }),
			{ headers: { "content-type": "application/json" } },
		);
	}
}
