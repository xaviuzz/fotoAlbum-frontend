import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FaceNumber } from "@/components/making/face/FaceNumber";
import { Button } from "@/components/ui/button";

export function FaceNavigation({
	face,
	onChange,
}: {
	face: FaceNumber;
	onChange: (face: FaceNumber) => void;
}) {
	return (
		<>
			<output aria-label="Posición">{face.label()}</output>
			<div className="flex gap-2">
				<Button
					variant="outline"
					disabled={face.isFirst()}
					onClick={() => onChange(face.previous())}
				>
					<ChevronLeft data-icon="inline-start" />
					Anterior
				</Button>
				<Button
					variant="outline"
					disabled={face.isLast()}
					onClick={() => onChange(face.next())}
				>
					Siguiente
					<ChevronRight data-icon="inline-end" />
				</Button>
			</div>
		</>
	);
}
