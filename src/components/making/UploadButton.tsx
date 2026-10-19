import { ImagePlus, Loader2 } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";

export function UploadButton({
	uploading,
	onChosen,
}: {
	uploading: boolean;
	onChosen: (files: File[]) => void;
}) {
	const chooser = useRef<HTMLInputElement>(null);

	const choose = (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		event.target.value = "";
		onChosen(files);
	};

	let icon = <ImagePlus data-icon="inline-start" />;
	if (uploading) {
		icon = <Loader2 data-icon="inline-start" className="animate-spin" />;
	}

	return (
		<>
			<input
				ref={chooser}
				type="file"
				multiple
				accept="image/jpeg,image/png,image/webp"
				aria-label="Fotos a subir"
				className="hidden"
				onChange={choose}
			/>
			<Button disabled={uploading} onClick={() => chooser.current?.click()}>
				{icon}
				Subir fotos
			</Button>
		</>
	);
}
