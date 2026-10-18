import { Route, Routes } from "react-router";
import { Header } from "@/components/layout/Header";
import { SessionGate } from "@/components/layout/SessionGate";
import { HomePage } from "@/pages/HomePage";
import { MakingPage } from "@/pages/MakingPage";

export function App() {
	return (
		<>
			<Header />
			<SessionGate>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/confeccion/:reference" element={<MakingPage />} />
				</Routes>
			</SessionGate>
		</>
	);
}
