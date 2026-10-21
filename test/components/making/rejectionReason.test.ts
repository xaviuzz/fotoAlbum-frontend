import { describe, expect, test } from "bun:test";
import { rejectionReasonOf } from "@/components/making/rejectionReason";

describe("rejectionReasonOf", () => {
	test("explains an unsupported format", () => {
		expect(rejectionReasonOf("UNSUPPORTED_FORMAT")).toBe("Formato no admitido");
	});

	test("explains a file that is too large", () => {
		expect(rejectionReasonOf("TOO_LARGE")).toBe("Supera los 25 MB");
	});

	test("explains an unreadable image", () => {
		expect(rejectionReasonOf("UNREADABLE_IMAGE")).toBe(
			"No se puede leer la imagen",
		);
	});
});
