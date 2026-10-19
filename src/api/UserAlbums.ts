import type { Client } from "openapi-fetch";
import type { components, paths } from "@/api/schema";
import { PresentedAlbum } from "@/lib/PresentedAlbum";
import type { Session } from "@/lib/Session";

export type UserAlbumErrorCode = components["schemas"]["ErrorBody"]["code"];

export type UserAlbumAnswer =
	| { status: "ok"; userAlbum: PresentedAlbum }
	| { status: "error"; code: UserAlbumErrorCode };

type UserAlbumBody =
	| components["schemas"]["UserAlbumGetReply"]["body"]
	| undefined;

export class UserAlbums {
	readonly #client: Client<paths>;
	readonly #session: Session;

	constructor(client: Client<paths>, session: Session) {
		this.#client = client;
		this.#session = session;
	}

	async get(): Promise<UserAlbumAnswer> {
		let answer: UserAlbumAnswer = { status: "error", code: "INTERNAL_ERROR" };
		try {
			const callId = crypto.randomUUID();
			const reply = await this.#client.POST("/userAlbum.get", {
				body: { header: this.#session.callHeader(callId) },
			});
			answer = this.answerOf(reply.data?.body);
		} catch {
			answer = { status: "error", code: "INTERNAL_ERROR" };
		}
		return answer;
	}

	async create(reference: string): Promise<UserAlbumAnswer> {
		let answer: UserAlbumAnswer = { status: "error", code: "INTERNAL_ERROR" };
		try {
			const callId = crypto.randomUUID();
			const reply = await this.#client.POST("/userAlbum.create", {
				body: {
					header: this.#session.callHeader(callId),
					body: { reference },
				},
			});
			answer = this.answerOf(reply.data?.body);
		} catch {
			answer = { status: "error", code: "INTERNAL_ERROR" };
		}
		return answer;
	}

	private answerOf(body: UserAlbumBody): UserAlbumAnswer {
		let answer: UserAlbumAnswer = { status: "error", code: "INTERNAL_ERROR" };
		if (body && "userAlbum" in body) {
			answer = { status: "ok", userAlbum: new PresentedAlbum(body.userAlbum) };
		}
		if (body && "code" in body) {
			answer = { status: "error", code: body.code };
		}
		return answer;
	}
}
