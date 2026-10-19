import { avatarColorOf } from "@/lib/avatarColor";

export class Session {
	private readonly identity: string;

	private constructor(identity: string) {
		this.identity = identity;
	}

	static start() {
		return new Session(crypto.randomUUID());
	}

	static restore(text: string) {
		let session = Session.start();
		try {
			const stored = JSON.parse(text);
			if (typeof stored?.identity === "string") {
				session = new Session(stored.identity);
			}
		} catch {
			session = Session.start();
		}
		return session;
	}

	startingOver() {
		return Session.start();
	}

	callHeader(callId: string) {
		return { callId, sessionId: this.identity };
	}

	avatarColor() {
		return avatarColorOf(this.identity);
	}

	serialize() {
		return JSON.stringify({ identity: this.identity });
	}
}
