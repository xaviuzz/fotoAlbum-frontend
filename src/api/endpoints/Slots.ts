import type { UserAlbumAnswer } from "@/api/endpoints/UserAlbums";
import type { CallSender } from "@/api/rpc/CallSender";
import type { components } from "@/api/schema";
import { PresentedAlbum } from "@/domain/album/PresentedAlbum";

type UserAlbumBody = components["schemas"]["UserAlbum"];

export class Slots {
	private readonly sender: CallSender;

	constructor(sender: CallSender) {
		this.sender = sender;
	}

	place(face: number, photoId: string): Promise<UserAlbumAnswer> {
		return this.sender.send(
			(client, header) =>
				client.POST("/slot.place", {
					body: { header, body: { face, photoId } },
				}),
			(body) => this.presented(body.userAlbum),
		);
	}

	empty(face: number): Promise<UserAlbumAnswer> {
		return this.sender.send(
			(client, header) =>
				client.POST("/slot.empty", { body: { header, body: { face } } }),
			(body) => this.presented(body.userAlbum),
		);
	}

	private presented(userAlbum: UserAlbumBody) {
		return { userAlbum: new PresentedAlbum(userAlbum) };
	}
}
