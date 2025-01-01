import { Loader, ClipboardCheck, Clipboard } from 'lucide-react';
import { encodeCompositeKey } from '@/utils/encoding';
import { LATEST_KEY_VERSION } from "@/constants";
import { encrypt } from "@/utils/encryption";
import type { Route } from "./+types/share";
import { useState, Fragment } from "react";
import { toBase58 } from '@/utils/base58';
import { toast } from "react-hot-toast";
import api from "../api";
import {
    Button, Input, Label, Textarea, Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "EnvBox Share" },
        { name: "description", content: "Share Environment Variables Securely" },
    ];
}

export default function Home() {
    const [text, setText] = useState("");
    const [reads, setReads] = useState(999);

    const [ttl, setTtl] = useState(7);
    const [ttlMultiplier, setTtlMultiplier] = useState(60 * 60 * 24);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const [link, setLink] = useState("");

    const onSubmit = async () => {
        try {
            setLoading(true);
            setLink("");

            const { encrypted, iv, key } = await encrypt(text);

            const { data: { id, message, status } } = await api.post("/api/v1/share", {
                ttl: ttl * ttlMultiplier,
                reads,
                encrypted: toBase58(encrypted),
                iv: toBase58(iv)
            });

            if (status !== "success") {
                toast.error(message);
            }

            const compositeKey = encodeCompositeKey(LATEST_KEY_VERSION, id, key);

            toast.success(message);

            const url = new URL(window.location.href);
            url.pathname = '/unseal';
            url.hash = compositeKey;
            setCopied(false);
            setLink(url.toString());
        } catch (e) {
            toast.error((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];
        if (file.size > 1024 * 16) {
            toast.error("File size must be less than 16kb");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const t = e.target!.result as string;
            console.log(t);
            setText(t);
        };
        reader.readAsText(file);
    }

    const handleTtlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (Number(e.target.value) < 1) {
            setTtl(0);
            return;
        }
        setTtl(Number(e.target.value));
    }

    return (
        <div className="container px-8 mx-auto mt-16 lg:mt-32 min-h-[calc(100vh-20rem)]">
            {link ? (
                <div className="flex flex-col items-center justify-center w-full h-full mt-8 md:mt-16 xl:mt-32">
                    <div className="py-4 text-5xl font-bold text-center text-transparent bg-gradient-to-t bg-clip-text from-zinc-100/60 to-white">Share this link with others</div>
                    <div className="relative flex items-stretch flex-grow mt-16 focus-within:z-10">
                        <pre className="px-4 py-3 font-mono text-center bg-transparent border rounded border-zinc-600 focus:border-zinc-100/80 focus:ring-0 sm:text-sm text-zinc-100">
                            {link}
                        </pre>
                        <button
                            type="button"
                            className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium duration-150 border text-zinc-700 border-zinc-300 rounded-r-md bg-zinc-50 hover focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 hover:text-zinc-900 hover:bg-white"
                            onClick={() => {
                                navigator.clipboard.writeText(link);
                                setCopied(true);
                            }}
                        >
                            {copied ? (
                                <ClipboardCheck className="w-5 h-5" aria-hidden="true" />
                            ) : (
                                <Clipboard className="w-5 h-5" aria-hidden="true" />
                            )}{" "}
                            <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                    </div>
                </div>
            ) : (
                <form
                    className="max-w-3xl mx-auto"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (text.length <= 0) return;
                        onSubmit();
                    }}
                >
                    <div className="py-4 text-5xl font-bold text-center text-transparent bg-gradient-to-t bg-clip-text from-zinc-100/60 to-white">Encrypt and Share</div>

                    <pre className="px-4 py-3 mt-8 font-mono text-left bg-transparent border rounded border-zinc-600 focus:border-zinc-100/80 focus:ring-0 sm:text-sm text-zinc-100">
                        <div className="flex items-start px-1 text-sm">
                            <div aria-hidden="true" className="pr-4 font-mono border-r select-none border-zinc-300/5 text-zinc-700">
                                {Array.from({
                                    length: text.split("\n").length,
                                }).map((_, index) => (
                                    <Fragment key={index}>
                                        {(index + 1).toString().padStart(2, "0")}
                                        <br />
                                    </Fragment>
                                ))}
                            </div>
                            <Textarea
                                id="text"
                                name="text"
                                value={text}
                                minLength={1}
                                onChange={(e) => setText(e.target.value)}
                                rows={Math.max(5, text.split("\n").length)}
                                placeholder="DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres"
                                className="w-full p-0 text-base bg-transparent border-0 appearance-none resize-none hover:resize text-zinc-100 placeholder-zinc-500 sm:text-sm focus:outline-none outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                            />
                        </div>
                    </pre>

                    <div className="flex flex-col items-center justify-center w-full gap-4 mt-4 sm:flex-row">
                        <div className="w-full sm:w-1/5">
                            <Label
                                className="flex items-center justify-center h-16 px-3 py-2 text-sm whitespace-no-wrap duration-150 border rounded hover:border-zinc-100/80 border-zinc-600 focus:border-zinc-100/80 focus:ring-0 text-zinc-100 hover:text-white hover:cursor-pointer "
                                htmlFor="file_input"
                            >
                                Upload a file
                            </Label>
                            <Input
                                className="hidden"
                                id="file_input"
                                type="file"
                                onChange={handleFileUpload}
                            />
                        </div>
                        <div className="w-full h-16 px-3 py-2 duration-150 border rounded sm:w-2/5 hover:border-zinc-100/80 border-zinc-600 focus-within:border-zinc-100/80 focus-within:ring-0 flex items-center justify-between">
                            <Label htmlFor="reads" className="block text-xs font-medium text-zinc-100">
                                READS
                            </Label>
                            <Input
                                type="number"
                                name="reads"
                                id="reads"
                                className="w-full p-0 text-base bg-transparent border-0 appearance-none text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-0 sm:text-sm text-center focus-visible:outline-none focus-visible:ring-0"
                                value={reads}
                                onChange={(e) => setReads(e.target.valueAsNumber)}
                            />
                        </div>
                        <div className="relative w-full h-16 px-3 py-2 duration-150 border rounded sm:w-2/5 hover:border-zinc-100/80 border-zinc-600 focus-within:border-zinc-100/80 focus-within:ring-0 ">
                            <div className="flex items-center justify-between h-full">
                                <Label htmlFor="reads" className="block text-xs font-medium text-zinc-100">
                                    TTL
                                </Label>
                                <Input
                                    type="number"
                                    name="reads"
                                    id="reads"
                                    className="w-full p-0 text-base bg-transparent border-0 appearance-none text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm ml-2 text-center focus-visible:outline-none focus-visible:ring-0"
                                    value={ttl}
                                    onChange={handleTtlChange}
                                />
                                <Select
                                    onValueChange={(e) => {
                                        setTtlMultiplier(Number(e));
                                    }}
                                >
                                    <SelectTrigger className="border-0 text-zinc-100 hover:border-zinc-100/80 focus-within:outline-none focus-within:ring-0 outline-none focus:ring-0">
                                        <SelectValue placeholder={ttl === 1 ? "Day" : "Days"} />
                                    </SelectTrigger>
                                    <SelectContent className="text-zinc-100 bg-[rgb(3_7_18)] focus-within:outline-none focus-within:ring-0 focus:outline-none outline-none focus:ring-0">
                                        <SelectItem
                                            value={"60"}
                                            className="text-zinc-100 hover:bg-[rgb(10_20_40)] focus:bg-[rgb(30_50_80)]"
                                        >
                                            {ttl === 1 ? "Minute" : "Minutes"}
                                        </SelectItem>
                                        <SelectItem
                                            value={"3600"}
                                            className="text-zinc-100 hover:bg-[rgb(10_20_40)] focus:bg-[rgb(30_50_80)]"
                                        >
                                            {ttl === 1 ? "Hour" : "Hours"}
                                        </SelectItem>
                                        <SelectItem
                                            value={"86400"}
                                            className="text-zinc-100 hover:bg-[rgb(10_20_40)] focus:bg-[rgb(30_50_80)]"
                                        >
                                            {ttl === 1 ? "Day" : "Days"}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading || text.length <= 0} 
                        className={`mt-8 w-full h-12 inline-flex justify-center items-center transition-all rounded px-4 py-1.5 md:py-2 text-base font-semibold leading-7 text-zinc-100 bg-[rgb(20_30_50)] ring-1 ring-[rgb(50_70_100)] duration-150 hover:text-white hover:bg-[rgb(30_50_80)] hover:drop-shadow-lg ${loading ? "animate-pulse" : ""
                            }`}
                    >
                        <span>
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : "Share"}
                        </span>
                    </Button>
                    <div className="mt-8">
                        <ul className="space-y-2 text-xs text-zinc-500">
                            <li>
                                <p>
                                    <span className="font-semibold text-zinc-400">Reads:</span> The number of reads determines how often
                                    the data can be shared, before it deletes itself. 0 means unlimited.
                                </p>
                            </li>
                            <li>
                                <p>
                                    <span className="font-semibold text-zinc-400">TTL:</span> You can add a TTL (time to live) to the
                                    data, to automatically delete it after a certain amount of time. 0 means no TTL.
                                </p>
                            </li>
                            <p>
                                Clicking Share will generate a new symmetrical key and encrypt your data before sending only the
                                encrypted data to the server.
                            </p>
                        </ul>
                    </div>
                </form>
            )}
        </div>
    );
}