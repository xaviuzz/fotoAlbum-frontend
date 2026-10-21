import { beforeEach, describe, expect, test } from "bun:test";
import createClient from "openapi-fetch";
import { Photos } from "@/api/endpoints/Photos";
import { CallSender } from "@/api/rpc/CallSender";
import type { paths } from "@/api/schema";
import { Session } from "@/domain/session/Session";

const firstPhoto = { id: "p1", thumbnailUrl: "/photos/session-1/p1/thumbnail" };
const secondPhoto = {
	id: "p2",
	thumbnailUrl: "/photos/session-1/p2/thumbnail",
};

describe("Photos list", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("answers the photos when the reply is ok", async () => {
		sut.answerWith((callId) =>
			okReply(callId, { photos: [firstPhoto, secondPhoto] }),
		);

		await sut.list();

		expect(sut.result()).toEqual({
			status: "ok",
			photos: [firstPhoto, secondPhoto],
		});
	});

	test("posts the session identity to /photo.list", async () => {
		await sut.list();

		expect(sut.pathPosted()).toBe("/photo.list");
		expect(sut.methodPosted()).toBe("POST");
		expect(sut.sessionPosted()).toBe("session-1");
		expect(sut.callIdPosted()).not.toBe("");
	});

	test("answers the error code when the reply is an error", async () => {
		sut.answerWith((callId) => errorReply(callId, "SESSION_REQUIRED"));

		await sut.list();

		expect(sut.result()).toEqual({ status: "error", code: "SESSION_REQUIRED" });
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

describe("Photos upload", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("answers the stored and the rejected files when the reply is ok", async () => {
		const rejected = { name: "notes.txt", code: "UNSUPPORTED_FORMAT" };
		sut.answerWith((callId) =>
			okReply(callId, { photos: [firstPhoto], rejected: [rejected] }),
		);

		await sut.upload(["a.jpg", "notes.txt"]);

		expect(sut.result()).toEqual({
			status: "ok",
			photos: [firstPhoto],
			rejected: [rejected],
		});
	});

	test("posts the files in order to /photo.upload as multipart", async () => {
		await sut.upload(["a.jpg", "b.png"]);

		expect(sut.pathPosted()).toBe("/photo.upload");
		expect(sut.methodPosted()).toBe("POST");
		expect(sut.contentTypePosted()).toContain("multipart/form-data");
		expect(sut.fileNamesPosted()).toEqual(["a.jpg", "b.png"]);
	});

	test("posts the session identity and a fresh callId", async () => {
		await sut.upload(["a.jpg"]);
		await sut.upload(["a.jpg"]);

		const [first, second] = sut.callIdsPosted();
		expect(sut.sessionPosted()).toBe("session-1");
		expect(first).not.toBe("");
		expect(first).not.toBe(second);
	});

	test("answers the error code when the reply is an error", async () => {
		sut.answerWith((callId) => errorReply(callId, "INVALID_BODY"));

		await sut.upload([]);

		expect(sut.result()).toEqual({ status: "error", code: "INVALID_BODY" });
	});

	test("answers an internal error when the answer is not 200", async () => {
		sut.answerWith(async () =>
			jsonReply(400, { code: "INVALID_BODY", message: "unreadable form" }),
		);

		await sut.upload(["a.jpg"]);

		expect(sut.result()).toEqual({ status: "error", code: "INTERNAL_ERROR" });
	});

	test("answers an internal error when the network fails", async () => {
		sut.failNetwork();

		await sut.upload(["a.jpg"]);

		expect(sut.result()).toEqual({ status: "error", code: "INTERNAL_ERROR" });
	});
});

type Answer = (callId: string) => Response | Promise<Response>;

type Received = {
	path: string;
	method: string;
	contentType: string;
	callId: string;
	sessionId: string;
	fileNames: string[];
};

class SUT {
	private answer: Answer = async (callId) =>
		okReply(callId, { photos: [], rejected: [] });
	private received: Received[] = [];
	private answered: unknown;
	private readonly photos: Photos;

	constructor() {
		const client = createClient<paths>({
			baseUrl: "http://localhost",
			fetch: async (request) => {
				const contentType = request.headers.get("content-type") ?? "";
				let callId = "";
				let sessionId = "";
				let fileNames: string[] = [];
				if (contentType.includes("multipart/form-data")) {
					const form = await request.formData();
					callId = String(form.get("callId"));
					sessionId = String(form.get("sessionId"));
					fileNames = form.getAll("files").map((file) => (file as File).name);
				} else {
					const call = await request.json();
					callId = call.header.callId;
					sessionId = call.header.sessionId;
				}
				this.received.push({
					path: new URL(request.url).pathname,
					method: request.method,
					contentType,
					callId,
					sessionId,
					fileNames,
				});
				return this.answer(callId);
			},
		});
		this.photos = new Photos(
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

	async list() {
		this.answered = await this.photos.list();
	}

	async upload(names: string[]) {
		const files = names.map((name) => new File(["bytes"], name));
		this.answered = await this.photos.upload(files);
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

	contentTypePosted() {
		return this.received[0]?.contentType;
	}

	sessionPosted() {
		return this.received[0]?.sessionId;
	}

	callIdPosted() {
		return this.received[0]?.callId;
	}

	callIdsPosted() {
		return this.received.map((call) => call.callId);
	}

	fileNamesPosted() {
		return this.received[0]?.fileNames;
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
