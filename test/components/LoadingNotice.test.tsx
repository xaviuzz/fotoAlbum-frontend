import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { LoadingNotice } from "@/components/LoadingNotice";

describe("LoadingNotice", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("announces quietly what is loading", () => {
		sut.show("Cargando fotos");

		expect(sut.status("Cargando fotos")).toHaveTextContent("Cargando…");
	});
});

class SUT {
	show(label: string) {
		render(<LoadingNotice label={label} />);
	}

	status(label: string) {
		return screen.getByRole("status", { name: label });
	}
}
