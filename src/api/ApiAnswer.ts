import type { ApiErrorCode } from "@/api/ApiErrorCode";

export type ApiAnswer<Ok extends object> =
	| ({ status: "ok" } & Ok)
	| { status: "error"; code: ApiErrorCode };
