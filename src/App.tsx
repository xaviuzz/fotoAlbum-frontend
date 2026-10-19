import { Route, Routes } from "react-router";
import { Header } from "@/components/layout/Header";
import { UserAlbumGate } from "@/components/layout/UserAlbumGate";
import { HomePage } from "@/pages/HomePage";
import { MakingPage } from "@/pages/MakingPage";

export function App() {
	return (
		<>
			<Header />
			<UserAlbumGate>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/confeccion" element={<MakingPage />} />
				</Routes>
			</UserAlbumGate>
		</>
	);
}
