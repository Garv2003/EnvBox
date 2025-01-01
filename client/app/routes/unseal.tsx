import { Loader, ClipboardCheck, Clipboard } from 'lucide-react';
import { Form, Link, useLocation } from "react-router";
import { Fragment, useState, useEffect } from "react";
import { decodeCompositeKey } from "@/utils/encoding";
import { Button, Label, Input } from "@/components";
import { decrypt } from "@/utils/encryption";
import type { Route } from "./+types/home";
import { toast } from "react-hot-toast"
import api from "../api";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "EnvBox Unseal" },
        { name: "description", content: "Unseal Environment Variables" },
    ];
}

export default function Unseal() {
    const location = useLocation();
    const [compositeKey, setCompositeKey] = useState<string>("");

    const [text, setText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [remainingReads, setRemainingReads] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const hash = location.hash;
        const id = hash.replace('#', '');
        if (id) {
            setCompositeKey(id);
        }
    }, [location.hash]);

    const onSubmit = async () => {
        try {
            setText(null);
            setLoading(true);

            if (!compositeKey) {
                toast.error("No id provided");
                return;
            }

            const { id, encryptionKey, version } = decodeCompositeKey(compositeKey);

            const { data: { iv, encrypted, remainingReads, message, status } } = await api.post('/api/v1/unseal', {
                id
            });

            if (status !== 'success') {
                toast.error(message);
                return;
            }

            setRemainingReads(remainingReads);

            const decrypted = await decrypt(encrypted, encryptionKey, iv, version);

            setText(decrypted);
            toast.success(message);
        } catch (e) {
            toast.error((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container px-8 mx-auto mt-16 lg:mt-32 min-h-[calc(100vh-22rem)]">
            {text ? (
                <div className="max-w-4xl mx-auto">
                    {remainingReads !== null ? (
                        <div className="text-sm text-center text-zinc-600">
                            {remainingReads > 0 ? (
                                <p>
                                    This document can be read <span className="text-zinc-100">{remainingReads}</span> more times.
                                </p>
                            ) : (
                                <p className="text-zinc-400">
                                    This was the last time this document could be read. It was deleted from storage.
                                </p>
                            )}
                        </div>
                    ) : null}
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
                            <div>
                                <pre className="flex overflow-x-auto">
                                    <code className="px-4 text-left">{text}</code>
                                </pre>
                            </div>
                        </div>
                    </pre>

                    <div className="flex items-center justify-end gap-4 mt-4">
                        <Link
                            to="/share"
                            type="button"
                            className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium duration-150 border rounded text-zinc-300 border-zinc-300/40 hover:border-zinc-300 focus:outline-none hover:text-white"
                        >
                            Share another
                        </Link>
                        <Button
                            type="button"
                            className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium duration-150 border rounded text-zinc-700 border-zinc-300 bg-zinc-50 hover focus:border-zinc-500 focus:outline-none hover:text-zinc-50 hover:bg-zinc-900"
                            onClick={() => {
                                toast.success("Copied to clipboard");
                                navigator.clipboard.writeText(text);
                                setCopied(true);
                            }}
                        >
                            {copied ? (
                                <ClipboardCheck className="w-5 h-5" aria-hidden="true" />
                            ) : (
                                <Clipboard className="w-5 h-5" aria-hidden="true" />
                            )}{" "}
                            <span>{copied ? "Copied" : "Copy"}</span>
                        </Button>
                    </div>
                </div>
            ) : (
                <Form
                    className="max-w-3xl mx-auto "
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="py-4 text-5xl font-bold text-center text-transparent bg-gradient-to-t bg-clip-text from-zinc-100/60 to-white">Decrypt a document</div>
                    <div className="px-3 py-2 mt-8 border rounded border-zinc-600 focus-within:border-zinc-100/80 focus-within:ring-0 ">
                        <Label htmlFor="id" className="block text-xs font-medium text-zinc-100">
                            ID
                        </Label>
                        <Input
                            type="text"
                            name="compositeKey"
                            id="compositeKey"
                            className="w-full p-0 text-base bg-transparent border-0 appearance-none text-zinc-100 outline-none placeholder-zinc-500 focus:ring-0 sm:text-sm focus-within:ring-0 focus-within:ring-offset-0 focus-within:outline-none focus-visible:outline-none focus-visible:ring-0"
                            value={compositeKey}
                            onChange={(e) => setCompositeKey(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className={`mt-8 w-full h-12 inline-flex justify-center items-center transition-all rounded px-4 py-1.5 md:py-2 text-base font-semibold leading-7 text-zinc-100 bg-[rgb(20_30_50)] ring-1 ring-[rgb(50_70_100)] duration-150 hover:text-white hover:bg-[rgb(30_50_80)] hover:drop-shadow-lg ${loading ? "animate-pulse" : ""
                            }`}
                    >
                        <span>
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : "Unseal"}
                        </span>
                    </Button>
                </Form>
            )}
        </div>
    );
}