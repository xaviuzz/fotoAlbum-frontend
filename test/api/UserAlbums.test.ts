import { beforeEach, describe, expect, test } from "bun:test";
import createClient from "openapi-fetch";
import { CallSender } from "@/api/CallSender";
import type { paths } from "@/api/schema";
import { UserAlbums } from "@/api/UserAlbums";
import { PresentedAlbum } from "@/lib/PresentedAlbum";
import { Session } from "@/lib/Session";

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

describe("UserAlbums get", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("answers the user album when the reply is ok", async () => {
		sut.answerWith((callId) => okReply(callId, { userAlbum }));

		await sut.get();

		expect(sut.result()).toEqual({
			status: "ok",
			userAlbum: new PresentedAlbum(userAlbum),
		});
	});

	test("posts a fresh callId and the session identity to /userAlbum.get", async () => {
		await sut.get();
		await sut.get();

		const [first, second] = sut.callIdsPosted();
		expect(sut.pathPosted()).toBe("/userAlbum.get");
		expect(sut.methodPosted()).toBe("POST");
		expect(sut.sessionsPosted()).toEqual(["session-1", "session-1"]);
		expect(first).not.toBe(second);
	});

	test("answers USER_ALBUM_NOT_FOUND when the session has none", async () => {
		sut.answerWith((callId) => errorReply(callId, "USER_ALBUM_NOT_FOUND"));

		await sut.get();

		expect(sut.result()).toEqual({
			status: "error",
			code: "USER_ALBUM_NOT_FOUND",
		});
	});

	test("answers an internal error when the network fails", async () => {
		sut.failNetwork();

		await sut.get();

		expect(sut.result()).toEqual({ status: "error", code: "INTERNAL_ERROR" });
	});
});

describe("UserAlbums create", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("answers the user album when the reply is ok", async () => {
		sut.answerWith((callId) => okReply(callId, { userAlbum }));

		await sut.create("SQ-210");

		expect(sut.result()).toEqual({
			status: "ok",
			userAlbum: new PresentedAlbum(userAlbum),
		});
	});

	test("posts the reference to /userAlbum.create", async () => {
		await sut.create("SQ-210");

		expect(sut.pathPosted()).toBe("/userAlbum.create");
		expect(sut.referencePosted()).toBe("SQ-210");
		expect(sut.sessionsPosted()).toEqual(["session-1"]);
	});

	test("answers USER_ALBUM_ALREADY_EXISTS when the session has one", async () => {
		sut.answerWith((callId) => errorReply(callId, "USER_ALBUM_ALREADY_EXISTS"));

		await sut.create("SQ-210");

		expect(sut.result()).toEqual({
			status: "error",
			code: "USER_ALBUM_ALREADY_EXISTS",
		});
	});

	test("answers an internal error when the network fails", async () => {
		sut.failNetwork();

		await sut.create("SQ-210");

		expect(sut.result()).toEqual({ status: "error", code: "INTERNAL_ERROR" });
	});
});

type Answer = (callId: string) => Response | Promise<Response>;

class SUT {
	private answer: Answer = async (callId) => okReply(callId, { userAlbum });
	private received: {
		path: string;
		method: string;
		callId: string;
		sessionId: string | undefined;
		reference: string | undefined;
	}[] = [];
	private answered: unknown;
	private readonly userAlbums: UserAlbums;

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
		this.userAlbums = new UserAlbums(
			new CallSender(client, Session.restore('{"identity":"session-1"}')),
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

	async get() {
		this.answered = await this.userAlbums.get();
	}

	async create(reference: string) {
		this.answered = await this.userAlbums.create(reference);
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
