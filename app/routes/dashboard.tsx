import type { Route } from "./+types/dashboard";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
    Button
} from "@/components"

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "EnvBox Dashboard" },
        { name: "description", content: "Dashboard for EnvBox" },
    ];
}

export default function Dashboard() {
    return (
        <div className="min-h-screen px-6 py-10 text-zinc-200">
            <motion.div
                className="text-center mb-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-zinc-400 via-zinc-300 to-zinc-200 bg-clip-text text-transparent">
                    Hello, EnvBox
                </h1>
                <p className="text-zinc-400 mt-4">
                    Manage your environment variables securely.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="p-6 bg-zinc-900 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.03 }}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-100">Document {i + 1}</h2>
                            <span className="text-sm px-3 py-1 rounded-full bg-zinc-700 text-zinc-300">
                                Updated
                            </span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-3">
                            A brief overview of document {i + 1}. Access it to explore details.
                        </p>
                        <div className="mt-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-all duration-300">
                                        Edit Profile
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-200 rounded-lg shadow-lg">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-bold text-zinc-100">Edit Profile</DialogTitle>
                                        <DialogDescription className="text-sm text-zinc-400">
                                            Make changes to your profile here. Click save when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-zinc-400 text-sm text-right">
                                                Name
                                            </Label>
                                            <Input
                                                id="name"
                                                value="Pedro Duarte"
                                                className="col-span-3 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg focus:ring focus:ring-zinc-600 focus:outline-none px-3 py-2"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="username" className="text-zinc-400 text-sm text-right">
                                                Username
                                            </Label>
                                            <Input
                                                id="username"
                                                value="@peduarte"
                                                className="col-span-3 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg focus:ring focus:ring-zinc-600 focus:outline-none px-3 py-2"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <button className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-600 transition-all duration-300">
                                            Save Changes
                                        </button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
