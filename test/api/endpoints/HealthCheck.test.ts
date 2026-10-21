import { beforeEach, describe, expect, test } from "bun:test";
import createClient from "openapi-fetch";
import { type Health, HealthCheck } from "@/api/endpoints/HealthCheck";
import type { paths } from "@/api/schema";
import { Session } from "@/domain/session/Session";

describe("HealthCheck", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("is ok when the reply status is ok", async () => {
		sut.answerOk();

		await sut.check();

		expect(sut.health()).toBe("ok");
	});

	test("is an error when the reply status is error", async () => {
		sut.answerError();

		await sut.check();

		expect(sut.health()).toBe("error");
	});

	test("is an error when the answer is not 200", async () => {
		sut.answerBadBody();

		await sut.check();

		expect(sut.health()).toBe("error");
	});

	test("is an error when the network fails", async () => {
		sut.failNetwork();

		await sut.check();

		expect(sut.health()).toBe("error");
	});

	test("carries the session identity", async () => {
		await sut.check();

		expect(sut.sessionsPosted()).toEqual(["session-1"]);
	});

	test("posts a fresh callId to /health.check", async () => {
		await sut.check();
		await sut.check();

		const [first, second] = sut.callIdsPosted();
		expect(sut.pathPosted()).toBe("/health.check");
		expect(sut.methodPosted()).toBe("POST");
		expect(first).not.toBe("");
		expect(first).not.toBe(second);
	});
});

type Answer = (callId: string) => Promise<Response>;

class SUT {
	private answer: Answer = async (callId) => okReply(callId);
	private received: {
		path: string;
		method: string;
		callId: string;
		sessionId: string | undefined;
	}[] = [];
	private result: Health | undefined;
	private readonly healthCheck: HealthCheck;

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
				});
				return this.answer(call.header.callId);
			},
		});
		this.healthCheck = new HealthCheck(
			client,
			Session.restore('{"identity":"session-1"}'),
		);
	}

	answerOk() {
		this.answer = async (callId) => okReply(callId);
	}

	answerError() {
		this.answer = async (callId) =>
			jsonReply(200, {
				header: { callId, status: "error" },
				body: { code: "INTERNAL_ERROR", message: "boom" },
			});
	}

	answerBadBody() {
		this.answer = async () =>
			jsonReply(400, { code: "INVALID_BODY", message: "callId is required" });
	}

	failNetwork() {
		this.answer = async () => {
			throw new TypeError("network down");
		};
	}

	async check() {
		this.result = await this.healthCheck.run();
	}

	health() {
		return this.result;
	}

	pathPosted() {
		return this.received[0]?.path;
	}

	methodPosted() {
		return this.received[0]?.method;
	}

	sessionsPosted() {
		return this.received.map((call) => call.sessionId);
	}

	callIdsPosted() {
		return this.received.map((call) => call.callId);
	}
}

function okReply(callId: string) {
	return jsonReply(200, {
		header: { callId, status: "ok" },
		body: { status: "ok" },
	});
}

function jsonReply(status: number, body: unknown) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}
