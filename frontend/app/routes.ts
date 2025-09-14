import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard._index.tsx", [
    route("overview", "routes/dashboard.overview.tsx"),
    route("wallets", "routes/dashboard.wallets.tsx"),
    route("settings", "routes/dashboard.settings.tsx"),
    route("charity", "routes/dashboard.charity.tsx"),
  ]),
] satisfies RouteConfig;
