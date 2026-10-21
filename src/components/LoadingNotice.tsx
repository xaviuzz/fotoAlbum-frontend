export function LoadingNotice({ label }: { label: string }) {
	return (
		<p role="status" aria-label={label} className="text-muted-foreground">
			Cargando…
		</p>
	);
}
