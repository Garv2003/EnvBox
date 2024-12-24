const stats = [
    {
        label: "Documents Encrypted",
        value: 100,
    },
    {
        label: "Documents Decrypted",
        value: 100,
    },
    {
        label: "GitHub Stars",
        value: 100,
    }
] satisfies { label: string; value: number }[];

export const Stats = () => {
    return (
        <section className="container mx-auto">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 ">
                {stats.map(({ label, value }) => (
                    <li
                        key={label}
                        className="flex items-center justify-between gap-2 px-4 py-3 overflow-hidden rounded m sm:flex-col"
                    >
                        <dd className="text-2xl font-bold tracking-tight text-center sm:text-5xl text-zinc-200">
                            {Intl.NumberFormat("en-US", { notation: "compact" }).format(value)}
                        </dd>
                        <dt className="leading-6 text-center text-zinc-500">{label}</dt>
                    </li>
                ))}
            </ul>
        </section>
    );
}