import type { Album } from "@/api/Albums";

export const bindingLabels: Record<Album["binding"], string> = {
	hardcover: "Tapa dura",
	softcover: "Tapa blanda",
};

export const orientationLabels: Record<Album["orientation"], string> = {
	square: "Cuadrado",
	portrait: "Vertical",
	landscape: "Apaisado",
};

export function sizeLabel(size: Album["albumSize"]) {
	return `${size.width} × ${size.height} mm`;
}
