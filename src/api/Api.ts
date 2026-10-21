import type { Client } from "openapi-fetch";
import { Albums } from "@/api/endpoints/Albums";
import { HealthCheck } from "@/api/endpoints/HealthCheck";
import { Photos } from "@/api/endpoints/Photos";
import { UserAlbums } from "@/api/endpoints/UserAlbums";
import { CallSender } from "@/api/rpc/CallSender";
import type { paths } from "@/api/schema";
import type { Session } from "@/domain/session/Session";

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
