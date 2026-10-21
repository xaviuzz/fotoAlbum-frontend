import { beforeEach, describe, expect, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { ApiProvider } from "@/api/ApiContext";
import { UserAlbumGate } from "@/components/layout/UserAlbumGate";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import { useCurrentUserAlbum } from "@/contexts/UserAlbumContext";
import { PresentedAlbum } from "@/lib/PresentedAlbum";
import { Session } from "@/lib/Session";
import { SessionStore } from "@/lib/SessionStore";
import { FakeStorage } from "../../support/FakeStorage";

const userAlbum = {
	id: "0190-user-album",
	reference: "SQ-210",
	commercialName: "Cuadrado clásico",
	albumSize: { width: 210, height: 210 },
	pageSize: { width: 200, height: 200 },
	pageCount: 24,
	binding: "hardcover" as const,
	orientation: "square" as const,
};

function Where() {
	const { adopt, userAlbum: current } = useCurrentUserAlbum();
	const { restart } = useSession();
	return (
		<>
			<output aria-label="Dirección">{useLocation().pathname}</output>
			<p>{current?.commercialName}</p>
			<button
				type="button"
				onClick={() => adopt(new PresentedAlbum(userAlbum))}
			>
				adopt
			</button>
			<button type="button" onClick={() => restart()}>
				restart
			</button>
		</>
	);
}

describe("UserAlbumGate", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows a quiet loading message while the user album is pending", () => {
		sut.leaveUnanswered();

		sut.showAt("/");

		expect(sut.loading()).toBeInTheDocument();
	});

	test("shows an alert when the user album cannot be read", async () => {
		sut.failReading();

		sut.showAt("/");

		expect(await sut.alert()).toHaveTextContent("No se pudo cargar el álbum");
	});

	test("leaves the catalogue address when the session has no user album", async () => {
		sut.showAt("/");

		expect(await sut.location()).toHaveTextContent("/");
	});

	test("sends a making address to the catalogue when the session has no user album", async () => {
		sut.showAt("/confeccion");

		expect(await sut.location()).toHaveTextContent("/");
	});

	test("sends an old making address with a reference to the catalogue when there is no user album", async () => {
		sut.showAt("/confeccion/SQ-210");

		expect(await sut.location()).toHaveTextContent("/");
	});

	test("sends the catalogue to the making page when the session has a user album", async () => {
		sut.ownsAnAlbum();

		sut.showAt("/");

		expect(await sut.location()).toHaveTextContent("/confeccion");
	});

	test("sends an old making address with a reference to the making page when there is a user album", async () => {
		sut.ownsAnAlbum();

		sut.showAt("/confeccion/SQ-210");

		expect(await sut.location()).toHaveTextContent("/confeccion");
	});

	test("leaves the making address when the session has a user album", async () => {
		sut.ownsAnAlbum();

		sut.showAt("/confeccion");

		expect(await sut.location()).toHaveTextContent("/confeccion");
	});

	test("offers the user album to what it shows", async () => {
		sut.ownsAnAlbum();

		sut.showAt("/confeccion");

		expect(await sut.name("Cuadrado clásico")).toBeInTheDocument();
	});

	test("takes a user album handed to it without asking again", async () => {
		sut.showAt("/");
		await sut.location();

		sut.adopt();

		expect(await sut.location()).toHaveTextContent("/confeccion");
		expect(sut.readings()).toBe(1);
	});

	test("asks again after starting over and sends the address to the catalogue", async () => {
		sut.ownsAnAlbum();
		sut.showAt("/confeccion");
		await sut.location();

		sut.restart();

		expect(await sut.locationAt("/")).toHaveTextContent("/");
		expect(sut.readings()).toBe(2);
	});
});

class SUT {
	private readonly session = Session.start();
	private readonly store = new SessionStore(new FakeStorage());
	private readonly owners = new Set<string>();
	private failing = false;
	private isAnswering = true;
	private count = 0;

	constructor() {
		this.store.save(this.session);
	}

	ownsAnAlbum() {
		this.owners.add(this.session.callHeader("c").sessionId);
	}

	leaveUnanswered() {
		this.isAnswering = false;
	}

	failReading() {
		this.failing = true;
	}

	showAt(path: string) {
		const fetch = async (request: Request) => {
			const call = await request.json();
			this.count += 1;
			let answer = new Promise<Response>(() => {});
			if (this.isAnswering) {
				answer = Promise.resolve(this.reply(call.header));
			}
			return answer;
		};
		render(
			<SessionProvider store={this.store}>
				<ApiProvider baseUrl="http://localhost" fetch={fetch}>
					<MemoryRouter initialEntries={[path]}>
						<UserAlbumGate>
							<Where />
						</UserAlbumGate>
					</MemoryRouter>
				</ApiProvider>
			</SessionProvider>,
		);
	}

	loading() {
		return screen.getByRole("status", { name: "Cargando álbum" });
	}

	alert() {
		return screen.findByRole("alert");
	}

	location() {
		return screen.findByRole("status", { name: "Dirección" });
	}

	locationAt(path: string) {
		return screen.findByText(path, { selector: "output" });
	}

	name(text: string) {
		return screen.findByText(text);
	}

	adopt() {
		act(() => screen.getByRole("button", { name: "adopt" }).click());
	}

	restart() {
		act(() => screen.getByRole("button", { name: "restart" }).click());
	}

	readings() {
		return this.count;
	}

	private reply(header: { callId: string; sessionId: string }) {
		let reply = errorReply(header.callId, "USER_ALBUM_NOT_FOUND");
		if (this.failing) {
			reply = errorReply(header.callId, "INTERNAL_ERROR");
		} else if (this.owners.has(header.sessionId)) {
			reply = okReply(header.callId, { userAlbum });
		}
		return reply;
	}
}

function okReply(callId: string, body: unknown) {
	return jsonReply({ header: { callId, status: "ok" }, body });
}

function errorReply(callId: string, code: string) {
	return jsonReply({
		header: { callId, status: "error" },
		body: { code, message: "failed" },
	});
}

function jsonReply(body: unknown) {
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}
