import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { ApiProvider } from "@/api/ApiContext";
import { AlbumCard } from "@/components/catalogue/AlbumCard";
import { PresentedAlbum } from "@/lib/PresentedAlbum";
import { UserAlbumContext } from "@/userAlbum/UserAlbumContext";
import { FreshSession } from "../../support/FreshSession";

const portraitUserAlbum = {
	id: "0190-user-album",
	reference: "PT-150",
	commercialName: "Retrato de bolsillo",
	albumSize: { width: 150, height: 210 },
	pageSize: { width: 140, height: 200 },
	pageCount: 20,
	binding: "softcover" as const,
	orientation: "portrait" as const,
};

const portraitAlbum = new PresentedAlbum(portraitUserAlbum);

function Where() {
	return <output aria-label="Dirección">{useLocation().pathname}</output>;
}

describe("AlbumCard", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows the commercial name, size, page count and binding", () => {
		sut.show(portraitAlbum);

		expect(sut.card()).toHaveTextContent("Retrato de bolsillo");
		expect(sut.card()).toHaveTextContent("150 × 210 mm");
		expect(sut.card()).toHaveTextContent("20 páginas");
		expect(sut.card()).toHaveTextContent("Tapa blanda");
	});

	test("creates nothing until it is pressed", () => {
		sut.show(portraitAlbum);

		expect(sut.referencesAsked()).toEqual([]);
	});

	test("asks for a user album of its model when pressed", async () => {
		sut.show(portraitAlbum);

		await sut.press();

		expect(sut.referencesAsked()).toEqual(["PT-150"]);
	});

	test("disables itself while the user album is being created", async () => {
		sut.leaveUnanswered();
		sut.show(portraitAlbum);

		await sut.press();

		expect(sut.card()).toBeDisabled();
	});

	test("hands the user album over and goes to the making page when created", async () => {
		sut.show(portraitAlbum);

		await sut.press();

		expect(await sut.location("/confeccion")).toBeInTheDocument();
		expect(sut.adopted()).toEqual([new PresentedAlbum(portraitUserAlbum)]);
	});

	test("reports the failure, stays and enables itself again when it cannot be created", async () => {
		sut.failCreating();
		sut.show(portraitAlbum);

		await sut.press();

		await waitFor(() => expect(sut.card()).toBeEnabled());
		expect(sut.failures()).toBe(1);
		expect(sut.adopted()).toEqual([]);
		expect(await sut.location("/")).toBeInTheDocument();
	});
});

class SUT {
	private readonly references: string[] = [];
	private readonly userAlbums: PresentedAlbum[] = [];
	private failureCount = 0;
	private isAnswering = true;
	private isFailing = false;

	leaveUnanswered() {
		this.isAnswering = false;
	}

	failCreating() {
		this.isFailing = true;
	}

	show(album: PresentedAlbum) {
		const fetch = async (request: Request) => {
			const call = await request.json();
			this.references.push(call.body.reference);
			let answer = new Promise<Response>(() => {});
			if (this.isAnswering) {
				answer = Promise.resolve(this.reply(call.header.callId));
			}
			return answer;
		};
		const adopt = (userAlbum: PresentedAlbum) => {
			this.userAlbums.push(userAlbum);
		};
		const onFailure = () => {
			this.failureCount += 1;
		};
		render(
			<FreshSession>
				<ApiProvider baseUrl="http://localhost" fetch={fetch}>
					<MemoryRouter>
						<UserAlbumContext.Provider value={{ userAlbum: null, adopt }}>
							<AlbumCard album={album} onFailure={onFailure} />
							<Where />
						</UserAlbumContext.Provider>
					</MemoryRouter>
				</ApiProvider>
			</FreshSession>,
		);
	}

	card() {
		return screen.getByRole("button", { name: /Retrato de bolsillo/ });
	}

	press() {
		return userEvent.click(this.card());
	}

	location(path: string) {
		return screen.findByText(path, { selector: "output" });
	}

	referencesAsked() {
		return this.references;
	}

	adopted() {
		return this.userAlbums;
	}

	failures() {
		return this.failureCount;
	}

	private reply(callId: string) {
		let body: unknown = { userAlbum: portraitUserAlbum };
		let status = "ok";
		if (this.isFailing) {
			body = { code: "INTERNAL_ERROR", message: "failed" };
			status = "error";
		}
		return new Response(JSON.stringify({ header: { callId, status }, body }), {
			headers: { "content-type": "application/json" },
		});
	}
}
