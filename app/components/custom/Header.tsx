import { Link, useLocation } from "react-router";

const navigation = [
    {
        name: "Share",
        href: "/share",
    },
    {
        name: "Unseal",
        href: "/unseal",
    },
    {
        name: "GitHub",
        href: "https://github.com/Garv2003/EnvBox",
        external: true,
    },
    {
        name: "Login",
        href: "/login",
    },
    {
        name: "Register",
        href: "/register"
    },
] satisfies { name: string; href: string; external?: boolean }[];

export const Header = () => {
    const location = useLocation();
    const pathname = location.pathname;

    return (
        <header className="top-0 z-30 w-full px-4 fixed backdrop-blur bh-zinc-900/50">
            <div className="container mx-auto">
                <div className="flex flex-col items-center justify-between gap-2 pt-6 sm:h-20 sm:flex-row sm:pt-0">
                    <Link to="/" className="text-3xl font-bold duration-150 text-zinc-100 hover:text-white">
                        EnvBox
                    </Link>
                    <nav className="flex items-center grow">
                        <ul className="flex flex-wrap items-center justify-end gap-4 grow">
                            {navigation.map((item) => (
                                <li className="" key={item.href}>
                                    <Link
                                        className={`flex items-center px-3 py-2 duration-150 text-sm sm:text-base font-medium hover:text-zinc-50
                    ${pathname === item.href ? "text-zinc-200" : "text-zinc-400"}`}
                                        to={item.href}
                                        target={item.external ? "_blank" : undefined}
                                        rel={item.external ? "noopener noreferrer" : undefined}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
};