import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import createClient from "openapi-fetch";
import { HealthCheck } from "@/api/HealthCheck";
import type { paths } from "@/api/schema";
import { Header } from "@/components/Header";

function pendingHealthCheck() {
	const client = createClient<paths>({
		baseUrl: "http://localhost",
		fetch: () => new Promise(() => {}),
	});
	return new HealthCheck(client);
}

describe("Header", () => {
	test("shows the app name with the health mark beside it", () => {
		render(<Header healthCheck={pendingHealthCheck()} />);

		const banner = screen.getByRole("banner");
		const heading = screen.getByRole("heading", { name: "fotoAlbum" });
		const mark = screen.getByRole("status");
		expect(banner).toContainElement(heading);
		expect(banner).toContainElement(mark);
	});
});
