import type { Client } from "openapi-fetch";
import type { paths } from "@/api/schema";
import type { Session } from "@/domain/session/Session";

export type Health = "ok" | "error";

export class HealthCheck {
	private readonly client: Client<paths>;
	private readonly session: Session;

	constructor(client: Client<paths>, session: Session) {
		this.client = client;
		this.session = session;
	}

	async run(): Promise<Health> {
		let health: Health = "error";
		try {
			const callId = crypto.randomUUID();
			const answer = await this.client.POST("/health.check", {
				body: { header: this.session.callHeader(callId) },
			});
			if (answer.data?.header.status === "ok") {
				health = "ok";
			}
		} catch {
			health = "error";
		}
		return health;
	}
}
