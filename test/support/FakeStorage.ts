export class FakeStorage {
	private text: string | null = null;

	getItem(_key: string) {
		return this.text;
	}

	setItem(_key: string, value: string) {
		this.text = value;
	}
}
