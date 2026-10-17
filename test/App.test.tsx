import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import createClient from "openapi-fetch";
import { App } from "@/App";
import { HealthCheck } from "@/api/HealthCheck";
import type { paths } from "@/api/schema";

function pendingHealthCheck() {
	const client = createClient<paths>({
		baseUrl: "http://localhost",
		fetch: () => new Promise(() => {}),
	});
	return new HealthCheck(client);
}

describe("App", () => {
	test("shows the app name and the health mark", () => {
		render(<App healthCheck={pendingHealthCheck()} />);

		expect(
			screen.getByRole("heading", { name: "fotoAlbum" }),
		).toBeInTheDocument();
		expect(screen.getByRole("status")).toBeInTheDocument();
	});
});
