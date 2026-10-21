import type { ApiAnswer } from "@/api/rpc/ApiAnswer";
import type { CallSender } from "@/api/rpc/CallSender";
import type { components } from "@/api/schema";
import { PresentedAlbum } from "@/domain/album/PresentedAlbum";

export type Album = components["schemas"]["Album"];

export type AlbumsAnswer = ApiAnswer<{ albums: PresentedAlbum[] }>;

export type AlbumAnswer = ApiAnswer<{ album: PresentedAlbum }>;

export class Albums {
	private readonly sender: CallSender;

	constructor(sender: CallSender) {
		this.sender = sender;
	}

	list(): Promise<AlbumsAnswer> {
		return this.sender.send(
			(client, header) => client.POST("/album.list", { body: { header } }),
			(body) => ({ albums: this.presented(body.albums) }),
		);
	}

	get(reference: string): Promise<AlbumAnswer> {
		return this.sender.send(
			(client, header) =>
				client.POST("/album.get", { body: { header, body: { reference } } }),
			(body) => ({ album: new PresentedAlbum(body.album) }),
		);
	}

	private presented(albums: Album[]): PresentedAlbum[] {
		const presented = [];
		for (const album of albums) {
			presented.push(new PresentedAlbum(album));
		}
		return presented;
	}
}
