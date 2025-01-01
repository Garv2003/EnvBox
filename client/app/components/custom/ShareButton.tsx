const Loader = ({ className }: { className: string }) => (
    <svg
        className={`${className} text-zinc-400`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        ></circle>
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
        ></path>
    </svg>
);

export const ShareButton = ({ loading, text, onClick }: { loading: boolean, text: string, onClick: () => void }) => {
    return (
        <button
            type="submit"
            disabled={loading || text.length <= 0}
            onClick={onClick}
            className={`mt-6 w-full h-12 inline-flex justify-center items-center transition-all rounded px-4 py-2 text-base font-semibold leading-7 ring-1 duration-150 ${text.length <= 0
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed ring-transparent"
                : "bg-[rgb(20_30_50)] text-zinc-900 hover:text-zinc-100 hover:ring-[rgb(50_70_100)] hover:bg-zinc-900/20"
                } ${loading ? "animate-pulse" : ""}`}
        >
            <span>
                {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                ) : (
                    "Share"
                )}
            </span>
        </button>
    );
};

