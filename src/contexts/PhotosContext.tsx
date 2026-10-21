import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useContext,
} from "react";
import { usePhotos } from "@/api/ApiContext";
import type { Photos, PhotosAnswer } from "@/api/endpoints/Photos";
import { type Reading, useReading } from "@/lib/useReading";

export type CurrentPhotos = {
	reading: Reading<PhotosAnswer>;
	setReading: Dispatch<SetStateAction<Reading<PhotosAnswer>>>;
};

const PhotosContext = createContext<CurrentPhotos | null>(null);

const listPhotos = (photos: Photos) => photos.list();

export function PhotosProvider({ children }: { children: ReactNode }) {
	const photos = usePhotos();
	const [reading, setReading] = useReading(photos, listPhotos);

	return (
		<PhotosContext.Provider value={{ reading, setReading }}>
			{children}
		</PhotosContext.Provider>
	);
}

export function useCurrentPhotos() {
	const current = useContext(PhotosContext);
	if (current === null) {
		throw new Error("useCurrentPhotos needs a PhotosProvider");
	}
	return current;
}
