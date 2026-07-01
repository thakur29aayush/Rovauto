import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/common/Logo";
import { useApp } from "@/hooks/useApp";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";

export default function DashboardLayout({ items, title }) {
  const { pathname } = useLocation();
  const { user, garage, logout, logoutGarage } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  const isDashboardLink = (to) =>
    to === "/dashboard" ||
    to === "/customer/dashboard" ||
    to === "/dashboard/customer" ||
    to === "/garage" ||
    to === "/admin";
  const isGaragePortal = pathname.startsWith("/garage");
  const isAdminPortal = pathname.startsWith("/admin");
  const account = isGaragePortal ? garage : user;
  const accountName = isGaragePortal
    ? account?.ownerName || account?.owner?.name || account?.name
    : account?.name;
  const accountRole = isGaragePortal ? "GARAGE_OWNER" : account?.role || "CUSTOMER";
  const handleLogout = async () => {
    if (isGaragePortal) {
      await logoutGarage();
      navigate("/garage/login");
      return;
    }

    await logout();
    navigate(isAdminPortal ? "/admin/login" : "/");
  };

  return (
    <div className="flex min-h-screen bg-bg-soft">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col border-r border-line bg-white transition-transform lg:sticky lg:top-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <Logo />

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-line lg:hidden"
            onClick={() => setOpen(false)}
          >
            <FiX />
          </button>
        </div>

        <nav className="grid flex-1 gap-1 overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={isDashboardLink(item.to)}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                    isActive
                      ? "bg-ink !text-white"
                      : "!text-ink/70 hover:bg-bg-soft hover:!text-ink",
                  ].join(" ")
                }
              >
                <Icon className="shrink-0 text-base" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand font-bold text-ink">
              {accountName?.[0] || "R"}
            </span>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {accountName || "Guest"}
              </div>
              <div className="truncate text-xs text-muted">
                {accountRole}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line px-4 py-2 text-sm transition hover:border-ink"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-5 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full border border-line lg:hidden"
              >
                <FiMenu />
              </button>

              <h1 className="text-lg font-semibold">{title}</h1>
            </div>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5 lg:p-10"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
