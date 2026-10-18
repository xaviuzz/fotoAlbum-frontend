import type { Client } from "openapi-fetch";
import type { components, paths } from "@/api/schema";
import { PresentedAlbum } from "@/lib/PresentedAlbum";

export type Album = components["schemas"]["Album"];
export type AlbumErrorCode = components["schemas"]["ErrorBody"]["code"];

export type AlbumsAnswer =
	| { status: "ok"; albums: PresentedAlbum[] }
	| { status: "error"; code: AlbumErrorCode };

export type AlbumAnswer =
	| { status: "ok"; album: PresentedAlbum }
	| { status: "error"; code: AlbumErrorCode };

export class Albums {
	readonly #client: Client<paths>;

	constructor(client: Client<paths>) {
		this.#client = client;
	}

	async list(): Promise<AlbumsAnswer> {
		let answer: AlbumsAnswer = { status: "error", code: "INTERNAL_ERROR" };
		try {
			const callId = crypto.randomUUID();
			const reply = await this.#client.POST("/album.list", {
				body: { header: { callId } },
			});
			const body = reply.data?.body;
			if (body && "albums" in body) {
				const albums = [];
				for (const album of body.albums) {
					albums.push(new PresentedAlbum(album));
				}
				answer = { status: "ok", albums };
			}
			if (body && "code" in body) {
				answer = { status: "error", code: body.code };
			}
		} catch {
			answer = { status: "error", code: "INTERNAL_ERROR" };
		}
		return answer;
	}

	async get(reference: string): Promise<AlbumAnswer> {
		let answer: AlbumAnswer = { status: "error", code: "INTERNAL_ERROR" };
		try {
			const callId = crypto.randomUUID();
			const reply = await this.#client.POST("/album.get", {
				body: { header: { callId }, body: { reference } },
			});
			const body = reply.data?.body;
			if (body && "album" in body) {
				answer = { status: "ok", album: new PresentedAlbum(body.album) };
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
