export const Stats = ({
    documentsEncrypted,
    documentsDecrypted,
    githubStars,
}: {
    documentsEncrypted: number;
    documentsDecrypted: number;
    githubStars: number;
}) => {
    return (
        <section className="container mx-auto">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 ">
                <li
                    key="Documents Encrypted"
                    className="flex items-center justify-between gap-2 px-4 py-3 overflow-hidden rounded m sm:flex-col"
                >
                    <dd className="text-2xl font-bold tracking-tight text-center sm:text-5xl text-zinc-200">
                        {Intl.NumberFormat("en-US", { notation: "compact" }).format(documentsEncrypted)}
                    </dd>
                    <dt className="leading-6 text-center text-zinc-500">Documents Encrypted</dt>
                </li>
                <li
                    key="Documents Decrypted"
                    className="flex items-center justify-between gap-2 px-4 py-3 overflow-hidden rounded m sm:flex-col"
                >
                    <dd className="text-2xl font-bold tracking-tight text-center sm:text-5xl text-zinc-200">
                        {Intl.NumberFormat("en-US", { notation: "compact" }).format(documentsDecrypted)}
                    </dd>
                    <dt className="leading-6 text-center text-zinc-500">Documents Decrypted</dt>
                </li>
                <li
                    key="GitHub Stars"
                    className="flex items-center justify-between gap-2 px-4 py-3 overflow-hidden rounded m sm:flex-col"
                >
                    <dd className="text-2xl font-bold tracking-tight text-center sm:text-5xl text-zinc-200">
                        {Intl.NumberFormat("en-US", { notation: "compact" }).format(githubStars)}
                    </dd>
                    <dt className="leading-6 text-center text-zinc-500">GitHub Stars</dt>
                </li>
            </ul>
        </section>
    );
}