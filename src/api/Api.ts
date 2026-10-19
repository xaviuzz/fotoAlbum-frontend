import type { Client } from "openapi-fetch";
import { Albums } from "@/api/Albums";
import { HealthCheck } from "@/api/HealthCheck";
import { Photos } from "@/api/Photos";
import type { paths } from "@/api/schema";
import type { Session } from "@/lib/Session";

export class Api {
	readonly healthCheck: HealthCheck;
	readonly albums: Albums;
	readonly photos: Photos;

	constructor(client: Client<paths>, session: Session) {
		this.healthCheck = new HealthCheck(client, session);
		this.albums = new Albums(client, session);
		this.photos = new Photos(client, session);
	}
}
