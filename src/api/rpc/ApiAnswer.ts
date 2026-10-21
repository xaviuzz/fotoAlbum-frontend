import type { ApiErrorCode } from "@/api/rpc/ApiErrorCode";

export type ApiAnswer<Ok extends object> =
	| ({ status: "ok" } & Ok)
	| { status: "error"; code: ApiErrorCode };
