import type { Client } from "openapi-fetch";
import { Albums } from "@/api/Albums";
import { CallSender } from "@/api/CallSender";
import { HealthCheck } from "@/api/HealthCheck";
import { Photos } from "@/api/Photos";
import type { paths } from "@/api/schema";
import { UserAlbums } from "@/api/UserAlbums";
import type { Session } from "@/lib/Session";

export class Api {
	readonly healthCheck: HealthCheck;
	readonly albums: Albums;
	readonly photos: Photos;
	readonly userAlbums: UserAlbums;

	constructor(client: Client<paths>, session: Session) {
		const sender = new CallSender(client, session);
		this.healthCheck = new HealthCheck(client, session);
		this.albums = new Albums(sender);
		this.photos = new Photos(sender);
		this.userAlbums = new UserAlbums(sender);
	}
}
