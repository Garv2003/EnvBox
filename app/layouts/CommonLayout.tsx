import { Header } from "@/components/custom/Header";
import { Footer } from "@/components/custom/Footer";
import { Outlet } from "react-router";

export default function CommonLayout() {
    return (
        <>
            <Header />
            <main className="container mx-auto pt-16">
                <Outlet />
            </main>
            <Footer />
        </>
    );
};