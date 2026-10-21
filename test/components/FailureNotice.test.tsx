import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { FailureNotice } from "@/components/FailureNotice";

describe("FailureNotice", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("alerts with the given message", () => {
		sut.show("No se pudo cargar");

		expect(sut.alert()).toHaveTextContent("No se pudo cargar");
	});
});

class SUT {
	show(message: string) {
		render(<FailureNotice message={message} />);
	}

	alert() {
		return screen.getByRole("alert");
	}
}
