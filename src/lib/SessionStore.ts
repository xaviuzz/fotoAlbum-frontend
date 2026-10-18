import { Session } from "@/lib/Session";

const KEY = "fotoAlbum.session";

type Storage = {
	getItem: (key: string) => string | null;
	setItem: (key: string, value: string) => void;
};

const noStorage: Storage = {
	getItem: () => null,
	setItem: () => {},
};

export class SessionStore {
	private readonly storage: Storage;

	constructor(storage: Storage) {
		this.storage = storage;
	}

	static inBrowser() {
		let storage = noStorage;
		try {
			storage = window.localStorage;
		} catch {
			storage = noStorage;
		}
		return new SessionStore(storage);
	}

	load() {
		let session = Session.start();
		try {
			const text = this.storage.getItem(KEY);
			if (text !== null) {
				session = Session.restore(text);
			}
		} catch {
			session = Session.start();
		}
		return session;
	}

	save(session: Session) {
		try {
			this.storage.setItem(KEY, session.serialize());
		} catch {}
	}
}
