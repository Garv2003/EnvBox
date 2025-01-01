import { Button, Stats } from "@/components";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import api from "../api";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "EnvBox" },
    { name: "description", content: "Share Environment Variables Securely" },
  ];
}

export async function clientLoader() {
  const stats = await api.get("/api/v1/stats");
  return stats.data;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-8 pb-8 md:gap-16 md:pb-16 xl:pb-24">
      <div className="flex flex-col items-center justify-center max-w-3xl px-8 mx-auto mt-8 sm:min-h-screen sm:mt-0 sm:px-0">
        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <Link
            to="https://github.com/Garv2003/EnvBox"
            className="text-zinc-400 relative overflow-hidden rounded-full py-1.5 px-4 text-sm leading-6 ring-1 ring-zinc-100/10 hover:ring-zinc-100/30 duration-150"
          >
            EnvBox is Open Source on{" "}
            <span className="font-semibold text-zinc-200">
              GitHub <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>
        </div>
        <div>
          <h1 className="py-4 text-5xl font-bold tracking-tight text-center text-transparent bg-gradient-to-t bg-clip-text from-zinc-100/50 to-white sm:text-7xl">
            Share Environment Variables Securely
          </h1>
          <p className="mt-6 leading-5 text-zinc-600 sm:text-center">
            Your document is encrypted in your browser before being stored for a limited period of time and read
            operations. Unencrypted data never leaves your browser.
          </p>
          <div className="flex flex-col justify-center gap-4 mx-auto mt-8 sm:flex-row sm:max-w-lg ">
            <Link
              to="/share"
            >
              <Button className="w-[400px] p-4 flex items-center justify-center bg-white text-zinc-900 hover:bg-zinc-50">
                <span className="font-semibold text-lg">Share</span>
                <span aria-hidden="true" className="font-semibold text-lg">&rarr;</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <h2 className="py-4 text-3xl font-bold text-center text-zinc-300 ">Used and trusted by a growing community</h2>
      <Stats documentsEncrypted={loaderData.documentsEncrypted} documentsDecrypted={loaderData.documentsDecrypted} githubStars={loaderData.githubStars} />
    </div>
  )
}
