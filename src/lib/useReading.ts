import { useEffect, useState } from "react";

export type Reading<Answer> = "loading" | Answer;

export function useReading<Source, Answer>(
	source: Source,
	read: (source: Source) => Promise<Answer>,
) {
	const [reading, setReading] = useState<Reading<Answer>>("loading");

	useEffect(() => {
		let isCurrent = true;
		setReading("loading");
		read(source).then((answer) => {
			if (isCurrent) {
				setReading(answer);
			}
		});
		return () => {
			isCurrent = false;
		};
	}, [source, read]);

	return [reading, setReading] as const;
}
