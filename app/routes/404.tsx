import type { Route } from "./+types/404";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { Button } from "@/components";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "EnvBox 404" },
        { name: "description", content: "Page Not Found" },
    ];
}

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-transparent text-zinc-200">
            <motion.h1
                className="text-9xl font-extrabold text-zinc-600"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                404
            </motion.h1>
            <motion.p
                className="text-lg mt-4 text-zinc-400"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                Oops! The page you're looking for doesn't exist.
            </motion.p>
            <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
            >
                <Link to="/">
                    <Button className="px-6 py-2 bg-black border border-zinc-600 text-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-900 transition-all duration-300">
                        Go Back Home
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
}
