import { beforeEach, describe, expect, test } from "bun:test";
import createClient from "openapi-fetch";
import { type Album, Albums } from "@/api/Albums";
import type { paths } from "@/api/schema";
import { PresentedAlbum } from "@/lib/PresentedAlbum";
import { Session } from "@/lib/Session";

const squareAlbum: Album = {
	reference: "SQ-210",
	commercialName: "Cuadrado clásico",
	albumSize: { width: 210, height: 210 },
	pageSize: { width: 200, height: 200 },
	pageCount: 24,
	binding: "hardcover",
	orientation: "square",
};

describe("Albums list", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("answers the albums when the reply is ok", async () => {
		sut.answerWith((callId) => okReply(callId, { albums: [squareAlbum] }));

		await sut.list();

		expect(sut.result()).toEqual({
			status: "ok",
			albums: [new PresentedAlbum(squareAlbum)],
		});
	});

	test("posts a fresh callId to /album.list", async () => {
		await sut.list();
		await sut.list();

		const [first, second] = sut.callIdsPosted();
		expect(sut.pathPosted()).toBe("/album.list");
		expect(sut.methodPosted()).toBe("POST");
		expect(first).not.toBe("");
		expect(first).not.toBe(second);
	});

	test("carries the session identity", async () => {
		await sut.list();
		await sut.get("SQ-210");

		expect(sut.sessionsPosted()).toEqual(["session-1", "session-1"]);
	});

	test("answers the error code when the reply is an error", async () => {
		sut.answerWith((callId) => errorReply(callId, "INTERNAL_ERROR"));

		await sut.list();

		expect(sut.result()).toEqual({ status: "error", code: "INTERNAL_ERROR" });
	});

	test("answers an internal error when the answer is not 200", async () => {
		sut.answerWith(async () =>
			jsonReply(400, { code: "INVALID_BODY", message: "callId is required" }),
		);

		await sut.list();

		expect(sut.result()).toEqual({ status: "error", code: "INTERNAL_ERROR" });
	});

	test("answers an internal error when the network fails", async () => {
		sut.failNetwork();

		await sut.list();

		expect(sut.result()).toEqual({ status: "error", code: "INTERNAL_ERROR" });
	});
});

describe("Albums get", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("answers the album when the reply is ok", async () => {
		sut.answerWith((callId) => okReply(callId, { album: squareAlbum }));

		await sut.get("SQ-210");

		expect(sut.result()).toEqual({
			status: "ok",
			album: new PresentedAlbum(squareAlbum),
		});
	});

	test("posts the reference to /album.get", async () => {
		await sut.get("SQ-210");

		expect(sut.pathPosted()).toBe("/album.get");
		expect(sut.referencePosted()).toBe("SQ-210");
	});

	test("answers ALBUM_NOT_FOUND when the album does not exist", async () => {
		sut.answerWith((callId) => errorReply(callId, "ALBUM_NOT_FOUND"));

		await sut.get("NOPE");

		expect(sut.result()).toEqual({ status: "error", code: "ALBUM_NOT_FOUND" });
	});

	test("answers an internal error when the network fails", async () => {
		sut.failNetwork();

		await sut.get("SQ-210");

		expect(sut.result()).toEqual({ status: "error", code: "INTERNAL_ERROR" });
	});
});

type Answer = (callId: string) => Response | Promise<Response>;

class SUT {
	private answer: Answer = async (callId) =>
		okReply(callId, { albums: [squareAlbum] });
	private received: {
		path: string;
		method: string;
		callId: string;
		sessionId: string | undefined;
		reference: string | undefined;
	}[] = [];
	private answered: unknown;
	private readonly albums: Albums;

	constructor() {
		const client = createClient<paths>({
			baseUrl: "http://localhost",
			fetch: async (request) => {
				const call = await request.json();
				this.received.push({
					path: new URL(request.url).pathname,
					method: request.method,
					callId: call.header.callId,
					sessionId: call.header.sessionId,
					reference: call.body?.reference,
				});
				return this.answer(call.header.callId);
			},
		});
		this.albums = new Albums(
			client,
			Session.restore('{"identity":"session-1"}'),
		);
	}

	answerWith(answer: Answer) {
		this.answer = answer;
	}

	failNetwork() {
		this.answer = async () => {
			throw new TypeError("network down");
		};
	}

	async list() {
		this.answered = await this.albums.list();
	}

	async get(reference: string) {
		this.answered = await this.albums.get(reference);
	}

	result() {
		return this.answered;
	}

	pathPosted() {
		return this.received[0]?.path;
	}

	methodPosted() {
		return this.received[0]?.method;
	}

	referencePosted() {
		return this.received[0]?.reference;
	}

	sessionsPosted() {
		return this.received.map((call) => call.sessionId);
	}

	callIdsPosted() {
		return this.received.map((call) => call.callId);
	}
}

function okReply(callId: string, body: unknown) {
	return jsonReply(200, { header: { callId, status: "ok" }, body });
}

function errorReply(callId: string, code: string) {
	return jsonReply(200, {
		header: { callId, status: "error" },
		body: { code, message: "failed" },
	});
}

function jsonReply(status: number, body: unknown) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}
