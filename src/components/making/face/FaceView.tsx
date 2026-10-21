import type { FaceNumber } from "@/components/making/face/FaceNumber";

const bindingStrips = {
	left: "left-0 bg-gradient-to-r",
	right: "right-0 bg-gradient-to-l",
};

export function FaceView({
	face,
	proportion,
}: {
	face: FaceNumber;
	proportion: string;
}) {
	const side = face.bindingSide();
	const faceStyle = {
		aspectRatio: proportion,
		width: `min(100cqw, calc(100cqh * ${proportion}))`,
	};

	return (
		<div className="flex min-h-0 w-full flex-1 items-center justify-center [container-type:size]">
			<div
				role="img"
				aria-label={face.describe()}
				data-binding-side={side}
				style={faceStyle}
				className="relative overflow-hidden rounded-sm border bg-card shadow-sm"
			>
				<span
					aria-hidden="true"
					className={`absolute inset-y-0 w-[6%] from-foreground/15 to-transparent ${bindingStrips[side]}`}
				/>
			</div>
		</div>
	);
}
