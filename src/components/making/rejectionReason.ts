import type { components } from "@/api/schema";

type RejectionCode = components["schemas"]["RejectionCode"];

const reasons: Record<RejectionCode, string> = {
	UNSUPPORTED_FORMAT: "Formato no admitido",
	TOO_LARGE: "Supera los 25 MB",
	UNREADABLE_IMAGE: "No se puede leer la imagen",
};

export function rejectionReasonOf(code: RejectionCode) {
	return reasons[code];
}
