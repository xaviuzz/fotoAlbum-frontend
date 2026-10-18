import { Route, Routes } from "react-router";
import { Header } from "@/components/layout/Header";
import { HomePage } from "@/pages/HomePage";
import { MakingPage } from "@/pages/MakingPage";

export function App() {
	return (
		<>
			<Header />
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/confeccion/:reference" element={<MakingPage />} />
			</Routes>
		</>
	);
}
