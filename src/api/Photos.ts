import type { Client } from "openapi-fetch";
import type { components, paths } from "@/api/schema";
import type { Session } from "@/lib/Session";

export type Photo = components["schemas"]["Photo"];
export type RejectedFile = components["schemas"]["RejectedFile"];
export type PhotoErrorCode = components["schemas"]["ErrorBody"]["code"];

export type PhotosAnswer =
	| { status: "ok"; photos: Photo[] }
	| { status: "error"; code: PhotoErrorCode };

export type UploadAnswer =
	| { status: "ok"; photos: Photo[]; rejected: RejectedFile[] }
	| { status: "error"; code: PhotoErrorCode };

export class Photos {
	readonly #client: Client<paths>;
	readonly #session: Session;

	constructor(client: Client<paths>, session: Session) {
		this.#client = client;
		this.#session = session;
	}

	async list(): Promise<PhotosAnswer> {
		let answer: PhotosAnswer = { status: "error", code: "INTERNAL_ERROR" };
		try {
			const callId = crypto.randomUUID();
			const reply = await this.#client.POST("/photo.list", {
				body: { header: this.#session.callHeader(callId) },
			});
			const body = reply.data?.body;
			if (body && "photos" in body) {
				answer = { status: "ok", photos: body.photos };
			}
			if (body && "code" in body) {
				answer = { status: "error", code: body.code };
			}
		} catch {
			answer = { status: "error", code: "INTERNAL_ERROR" };
		}
		return answer;
	}

	async upload(files: File[]): Promise<UploadAnswer> {
		let answer: UploadAnswer = { status: "error", code: "INTERNAL_ERROR" };
		try {
			const header = this.#session.callHeader(crypto.randomUUID());
			const form = new FormData();
			form.append("callId", header.callId);
			form.append("sessionId", header.sessionId);
			for (const file of files) {
				form.append("files", file);
			}
			const reply = await this.#client.POST("/photo.upload", {
				body: { ...header, files: [] },
				bodySerializer: () => form,
			});
			const body = reply.data?.body;
			if (body && "photos" in body) {
				answer = { status: "ok", photos: body.photos, rejected: body.rejected };
			}
			if (body && "code" in body) {
				answer = { status: "error", code: body.code };
			}
		} catch {
			answer = { status: "error", code: "INTERNAL_ERROR" };
		}
		return answer;
	}
}
