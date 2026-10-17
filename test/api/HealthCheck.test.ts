import { describe, expect, test } from "bun:test";
import createClient from "openapi-fetch";
import { HealthCheck } from "@/api/HealthCheck";
import type { paths } from "@/api/schema";

function healthCheckAnswering(answer: (request: Request) => Promise<Response>) {
	const client = createClient<paths>({
		baseUrl: "http://localhost",
		fetch: answer,
	});
	return new HealthCheck(client);
}

function jsonReply(status: number, body: unknown) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

describe("HealthCheck", () => {
	test("is ok when the reply status is ok", async () => {
		const healthCheck = healthCheckAnswering(async () =>
			jsonReply(200, {
				header: { callId: "c", status: "ok" },
				body: { status: "ok" },
			}),
		);

		const health = await healthCheck.run();

		expect(health).toBe("ok");
	});

	test("is an error when the reply status is error", async () => {
		const healthCheck = healthCheckAnswering(async () =>
			jsonReply(200, {
				header: { callId: "c", status: "error" },
				body: { code: "INTERNAL_ERROR", message: "boom" },
			}),
		);

		const health = await healthCheck.run();

		expect(health).toBe("error");
	});

	test("is an error when the answer is not 200", async () => {
		const healthCheck = healthCheckAnswering(async () =>
			jsonReply(400, { code: "INVALID_BODY", message: "callId is required" }),
		);

		const health = await healthCheck.run();

		expect(health).toBe("error");
	});

	test("is an error when the network fails", async () => {
		const healthCheck = healthCheckAnswering(async () => {
			throw new TypeError("network down");
		});

		const health = await healthCheck.run();

		expect(health).toBe("error");
	});

	test("posts a fresh callId to /health.check", async () => {
		const received: { path: string; method: string; callId: string }[] = [];
		const healthCheck = healthCheckAnswering(async (request) => {
			const call = await request.json();
			received.push({
				path: new URL(request.url).pathname,
				method: request.method,
				callId: call.header.callId,
			});
			return jsonReply(200, {
				header: { callId: call.header.callId, status: "ok" },
				body: { status: "ok" },
			});
		});

		await healthCheck.run();
		await healthCheck.run();

		const [first, second] = received;
		expect(first?.path).toBe("/health.check");
		expect(first?.method).toBe("POST");
		expect(first?.callId).not.toBe("");
		expect(first?.callId).not.toBe(second?.callId);
	});
});
