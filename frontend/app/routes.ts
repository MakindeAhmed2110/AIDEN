import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard._index.tsx", [
    route("overview", "routes/dashboard.overview.tsx"),
    route("referrals", "routes/dashboard.referrals.tsx"),
    route("rewards", "routes/dashboard.rewards.tsx"),
    route("wallets", "routes/dashboard.wallets.tsx"),
    route("charity", "routes/dashboard.charity.tsx"),
  ]),
] satisfies RouteConfig;
