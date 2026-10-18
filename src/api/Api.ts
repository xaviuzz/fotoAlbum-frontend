import type { Client } from "openapi-fetch";
import { Albums } from "@/api/Albums";
import { HealthCheck } from "@/api/HealthCheck";
import type { paths } from "@/api/schema";

export class Api {
	readonly healthCheck: HealthCheck;
	readonly albums: Albums;

	constructor(client: Client<paths>) {
		this.healthCheck = new HealthCheck(client);
		this.albums = new Albums(client);
	}
}
