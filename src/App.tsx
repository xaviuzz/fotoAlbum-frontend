import type { HealthCheck } from "@/api/HealthCheck";
import { Header } from "@/components/Header";

export function App({ healthCheck }: { healthCheck: HealthCheck }) {
	return <Header healthCheck={healthCheck} />;
}
