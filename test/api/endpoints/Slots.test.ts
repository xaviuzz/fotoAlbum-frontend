import { beforeEach, describe, expect, test } from "bun:test";
import createClient from "openapi-fetch";
import { Slots } from "@/api/endpoints/Slots";
import { CallSender } from "@/api/rpc/CallSender";
import type { paths } from "@/api/schema";
import { PresentedAlbum } from "@/domain/album/PresentedAlbum";
import { Session } from "@/domain/session/Session";

const userAlbum = {
	id: "0190-user-album",
	reference: "SQ-210",
	commercialName: "Cuadrado clásico",
	albumSize: { width: 210, height: 210 },
	pageSize: { width: 200, height: 200 },
	pageCount: 24,
	binding: "hardcover" as const,
	orientation: "square" as const,
	slots: [{ face: 1, photoId: "photo-1" }],
};

describe("Slots place", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("answers the user album with its slots when the reply is ok", async () => {
		sut.answerWith((callId) => okReply(callId, { userAlbum }));

		await sut.place(1, "photo-1");

		expect(sut.result()).toEqual({
			status: "ok",
			userAlbum: new PresentedAlbum(userAlbum, userAlbum.slots),
		});
	});

	test("posts the face and the photo to /slot.place with a fresh callId and the session", async () => {
		await sut.place(1, "photo-1");
		await sut.place(2, "photo-2");

		const [first, second] = sut.callIdsPosted();
		expect(sut.pathPosted()).toBe("/slot.place");
		expect(sut.methodPosted()).toBe("POST");
		expect(sut.bodiesPosted()).toEqual([
			{ face: 1, photoId: "photo-1" },
			{ face: 2, photoId: "photo-2" },
		]);
		expect(sut.sessionsPosted()).toEqual(["session-1", "session-1"]);
		expect(first).not.toBe(second);
	});

	test("answers PHOTO_NOT_FOUND when the photo is not the session's", async () => {
		sut.answerWith((callId) => errorReply(callId, "PHOTO_NOT_FOUND"));

		await sut.place(1, "photo-9");

		expect(sut.result()).toEqual({
			status: "error",
			code: "PHOTO_NOT_FOUND",
		});
	});

	test("answers FACE_NOT_FOUND when the face is outside the album", async () => {
		sut.answerWith((callId) => errorReply(callId, "FACE_NOT_FOUND"));

		await sut.place(99, "photo-1");

		expect(sut.result()).toEqual({ status: "error", code: "FACE_NOT_FOUND" });
	});

	test("answers an internal error when the network fails", async () => {
		sut.failNetwork();

		await sut.place(1, "photo-1");

		expect(sut.result()).toEqual({ status: "error", code: "INTERNAL_ERROR" });
	});
});

describe("Slots empty", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("answers the user album with its slots when the reply is ok", async () => {
		sut.answerWith((callId) => okReply(callId, { userAlbum }));

		await sut.empty(1);

		expect(sut.result()).toEqual({
			status: "ok",
			userAlbum: new PresentedAlbum(userAlbum, userAlbum.slots),
		});
	});

	test("posts only the face to /slot.empty with the session", async () => {
		await sut.empty(1);

		expect(sut.pathPosted()).toBe("/slot.empty");
		expect(sut.bodiesPosted()).toEqual([{ face: 1 }]);
		expect(sut.sessionsPosted()).toEqual(["session-1"]);
	});

	test("answers USER_ALBUM_NOT_FOUND when the session has none", async () => {
		sut.answerWith((callId) => errorReply(callId, "USER_ALBUM_NOT_FOUND"));

		await sut.empty(1);

		expect(sut.result()).toEqual({
			status: "error",
			code: "USER_ALBUM_NOT_FOUND",
		});
	});

	test("answers an internal error when the network fails", async () => {
		sut.failNetwork();

		await sut.empty(1);

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
		body: unknown;
	}[] = [];
	private answered: unknown;
	private readonly slots: Slots;

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
					body: call.body,
				});
				return this.answer(call.header.callId);
			},
		});
		this.slots = new Slots(
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

	async place(face: number, photoId: string) {
		this.answered = await this.slots.place(face, photoId);
	}

	async empty(face: number) {
		this.answered = await this.slots.empty(face);
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

	bodiesPosted() {
		return this.received.map((call) => call.body);
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
