import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { RejectedFiles } from "@/components/making/RejectedFiles";

describe("RejectedFiles", () => {
	test("lists each file with the reason it was rejected", () => {
		render(
			<RejectedFiles
				rejected={[
					{ name: "notes.txt", code: "UNSUPPORTED_FORMAT" },
					{ name: "huge.jpg", code: "TOO_LARGE" },
				]}
			/>,
		);

		const items = screen.getAllByRole("listitem");
		expect(items[0]).toHaveTextContent("notes.txt: Formato no admitido");
		expect(items[1]).toHaveTextContent("huge.jpg: Supera los 25 MB");
	});

	test("shows nothing when no file was rejected", () => {
		render(<RejectedFiles rejected={[]} />);

		expect(screen.queryByRole("list")).not.toBeInTheDocument();
	});
});
