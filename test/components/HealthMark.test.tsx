import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import createClient from "openapi-fetch";
import { HealthCheck } from "@/api/HealthCheck";
import type { paths } from "@/api/schema";
import { HealthMark } from "@/components/HealthMark";

function healthCheckAnswering(answer: () => Promise<Response>) {
	const client = createClient<paths>({
		baseUrl: "http://localhost",
		fetch: answer,
	});
	return new HealthCheck(client);
}

function okReply() {
	const body = {
		header: { callId: "c", status: "ok" },
		body: { status: "ok" },
	};
	return new Response(JSON.stringify(body), {
		headers: { "content-type": "application/json" },
	});
}

describe("HealthMark", () => {
	test("is neutral while the check is pending", () => {
		const healthCheck = healthCheckAnswering(() => new Promise(() => {}));

		render(<HealthMark healthCheck={healthCheck} />);

		const mark = screen.getByRole("status");
		expect(mark).toHaveAccessibleName("Checking service");
	});

	test("turns into a green check when the service is ok", async () => {
		const healthCheck = healthCheckAnswering(async () => okReply());

		render(<HealthMark healthCheck={healthCheck} />);

		const mark = await screen.findByRole("status", { name: "Service is up" });
		expect(mark).toHaveClass("text-ok");
	});

	test("turns into a red cross when the check fails", async () => {
		const healthCheck = healthCheckAnswering(async () => {
			throw new TypeError("network down");
		});

		render(<HealthMark healthCheck={healthCheck} />);

		const mark = await screen.findByRole("status", { name: "Service is down" });
		expect(mark).toHaveClass("text-error");
	});

	test("checks once on load", async () => {
		let checks = 0;
		const healthCheck = healthCheckAnswering(async () => {
			checks += 1;
			return okReply();
		});

		render(<HealthMark healthCheck={healthCheck} />);
		await screen.findByRole("status", { name: "Service is up" });

		expect(checks).toBe(1);
	});
});
