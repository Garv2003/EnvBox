import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("layouts/CommonLayout.tsx", [
        index("routes/home.tsx"),
        route("/share", "routes/share.tsx"),
        route("/unseal", "routes/unseal.tsx"),
    ]),
    route("*", "routes/404.tsx"),
] satisfies RouteConfig;
