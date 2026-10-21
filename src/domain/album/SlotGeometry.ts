import { Millimetres } from "@/domain/album/Millimetres";

const MARGIN_PERCENT = 5;
const FAR_EDGE_PERCENT = 95;

type PageSize = { width: number; height: number };

export type SlotPlacement = {
	left: number;
	top: number;
	width: number;
	height: number;
};

export class SlotGeometry {
	private readonly pageWidth: Millimetres;
	private readonly pageHeight: Millimetres;

	private constructor(pageWidth: Millimetres, pageHeight: Millimetres) {
		this.pageWidth = pageWidth;
		this.pageHeight = pageHeight;
	}

	static of(pageSize: PageSize) {
		const pageWidth = Millimetres.of(pageSize.width);
		const pageHeight = Millimetres.of(pageSize.height);
		return new SlotGeometry(pageWidth, pageHeight);
	}

	placement(): SlotPlacement {
		const left = this.pageWidth.roundedUpPercent(MARGIN_PERCENT);
		const right = this.pageWidth.roundedDownPercent(FAR_EDGE_PERCENT);
		const top = this.pageHeight.roundedUpPercent(MARGIN_PERCENT);
		const bottom = this.pageHeight.roundedDownPercent(FAR_EDGE_PERCENT);
		const placement = {
			left: left.asPercentOf(this.pageWidth),
			top: top.asPercentOf(this.pageHeight),
			width: right.minus(left).asPercentOf(this.pageWidth),
			height: bottom.minus(top).asPercentOf(this.pageHeight),
		};
		return placement;
	}
}
