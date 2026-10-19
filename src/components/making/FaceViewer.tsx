import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaceNumber } from "@/lib/FaceNumber";
import type { PresentedAlbum } from "@/lib/PresentedAlbum";

const bindingStrips = {
	left: "left-0 bg-gradient-to-r",
	right: "right-0 bg-gradient-to-l",
};

export function FaceViewer({ album }: { album: PresentedAlbum }) {
	const [face, setFace] = useState(() => FaceNumber.first(album.pageCount));
	const proportion = album.pageProportion();
	const side = face.bindingSide();
	const faceStyle = {
		aspectRatio: proportion,
		width: `min(100cqw, calc(100cqh * ${proportion}))`,
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col items-center gap-4">
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
			<output aria-label="Posición">{face.label()}</output>
			<div className="flex gap-2">
				<Button
					variant="outline"
					disabled={face.isFirst()}
					onClick={() => setFace(face.previous())}
				>
					<ChevronLeft data-icon="inline-start" />
					Anterior
				</Button>
				<Button
					variant="outline"
					disabled={face.isLast()}
					onClick={() => setFace(face.next())}
				>
					Siguiente
					<ChevronRight data-icon="inline-end" />
				</Button>
			</div>
		</div>
	);
}
