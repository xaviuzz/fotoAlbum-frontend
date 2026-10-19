import { avatarColorOf } from "@/lib/avatarColor";

export class Session {
	private readonly identity: string;
	private readonly chosenReference: string | null;

	private constructor(identity: string, chosenReference: string | null) {
		this.identity = identity;
		this.chosenReference = chosenReference;
	}

	static start() {
		return new Session(crypto.randomUUID(), null);
	}

	static restore(text: string) {
		let session = Session.start();
		try {
			const stored = JSON.parse(text);
			const hasIdentity = typeof stored?.identity === "string";
			const hasChosen = typeof stored?.chosenReference === "string";
			if (hasIdentity && hasChosen) {
				session = new Session(stored.identity, stored.chosenReference);
			} else if (hasIdentity) {
				session = new Session(stored.identity, null);
			}
		} catch {
			session = Session.start();
		}
		return session;
	}

	choosing(reference: string) {
		return new Session(this.identity, reference);
	}

	startingOver() {
		return Session.start();
	}

	path() {
		let path = "/";
		if (this.chosenReference !== null) {
			path = `/confeccion/${this.chosenReference}`;
		}
		return path;
	}

	callHeader(callId: string) {
		return { callId, sessionId: this.identity };
	}

	avatarColor() {
		return avatarColorOf(this.identity);
	}

	serialize() {
		return JSON.stringify({
			identity: this.identity,
			chosenReference: this.chosenReference,
		});
	}
}
