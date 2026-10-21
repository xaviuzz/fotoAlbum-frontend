import type { ApiAnswer } from "@/api/ApiAnswer";
import type { CallSender } from "@/api/CallSender";
import type { components } from "@/api/schema";
import { PresentedAlbum } from "@/lib/PresentedAlbum";

export type UserAlbumAnswer = ApiAnswer<{ userAlbum: PresentedAlbum }>;

type UserAlbumOkBody = components["schemas"]["UserAlbum"];

export class UserAlbums {
	private readonly sender: CallSender;

	constructor(sender: CallSender) {
		this.sender = sender;
	}

	get(): Promise<UserAlbumAnswer> {
		return this.sender.send(
			(client, header) => client.POST("/userAlbum.get", { body: { header } }),
			(body) => this.presented(body),
		);
	}

	create(reference: string): Promise<UserAlbumAnswer> {
		return this.sender.send(
			(client, header) =>
				client.POST("/userAlbum.create", {
					body: { header, body: { reference } },
				}),
			(body) => this.presented(body),
		);
	}

	private presented(body: { userAlbum: UserAlbumOkBody }) {
		return { userAlbum: new PresentedAlbum(body.userAlbum) };
	}
}
