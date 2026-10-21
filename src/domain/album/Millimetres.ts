export class Millimetres {
	private readonly value: number;

	private constructor(value: number) {
		this.value = value;
	}

	static of(value: number) {
		return new Millimetres(value);
	}

	roundedUpPercent(percent: number) {
		const exactMillimetres = (this.value * percent) / 100;
		return new Millimetres(Math.ceil(exactMillimetres));
	}

	roundedDownPercent(percent: number) {
		const exactMillimetres = (this.value * percent) / 100;
		return new Millimetres(Math.floor(exactMillimetres));
	}

	minus(other: Millimetres) {
		return new Millimetres(this.value - other.value);
	}

	asPercentOf(whole: Millimetres) {
		return (this.value / whole.value) * 100;
	}
}
