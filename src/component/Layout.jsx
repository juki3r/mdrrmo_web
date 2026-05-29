import { useEffect, useState } from "react";
import { Menu, Bell } from "lucide-react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  LayoutDashboard,
  AlertTriangle,
  Truck,
  Home,
  FileText,
  BarChart3,
  Users,
  Settings,
  Newspaper,
  Spotlight,
  BookAlert,
  NotebookText,
  Gavel,
  CalendarDays,
  MessagesSquare,
  CloudSun,
  TabletSmartphone,
  SquareUser,
  HousePlus,
  ShieldAlert,
} from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString();

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  };

  const user = getUser();
  const role = user?.role;

  const menu = role === "bdrrmo_admin"
    ? [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Residents", path: "/residents", icon: Users },
        { name: "Certificates", path: "/certificates", icon: Newspaper },
        { name: "Concerns", path: "/concerns", icon: Spotlight },
        { name: "Blotters", path: "/blotters", icon: BookAlert },
        { name: "News & Alerts", path: "/news", icon: NotebookText },
        { name: "Ordinance", path: "/ordinance", icon: Gavel },
        { name: "Incidents", path: "/incidents", icon: AlertTriangle },
        { name: "Evacuation Centers", path: "/evacuation-centers", icon: HousePlus },
        { name: "Officials", path: "/officials", icon: Users },
        { name: "Calendar", path: "/events", icon: CalendarDays },
        { name: "Weather", path: "/weather", icon: CloudSun },
        { name: "SMS", path: "/sms", icon: MessagesSquare },
        { name: "Contacts", path: "/emergencycontacts", icon: SquareUser },
        { name: "App Users", path: "/appusers", icon: TabletSmartphone },
      ]
    : [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Alerts", path: "/alerts", icon: Bell },
        { name: "Incidents", path: "/incidents", icon: AlertTriangle },
        { name: "Operations", path: "/operations", icon: Truck },
        { name: "Barangays", path: "/barangays", icon: Home },
        { name: "Reports", path: "/reports", icon: FileText },
        { name: "Analytics", path: "/analytics", icon: BarChart3 },
        { name: "Users", path: "/users", icon: Users },
        { name: "Settings", path: "/settings", icon: Settings },
      ];



  const handleLogout = async () => {
  await fetch("https://ajcpisonet.com/api/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      Accept: "application/json",
    },
  });

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
};

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#091935] text-gray-200">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden md:flex w-64 flex-col border-r border-gray-800 bg-[#091935]">

        {/* LOGO */}
        <div className="p-4 flex items-center gap-3">
          <img
            src="/drr2.png"
            className="w-12 h-12 rounded-full bg-orange-500 p-1"
          />

          <div>
            <div className="font-bold text-sm">
              {role === "bdrrmo_admin" ? "BICDP" : "MICDP"}
            </div>
            <div className="text-xs text-gray-400">
              {role === "bdrrmo_admin"
                ? `${user?.barangay}, ${user?.municipality}`
                : `${user?.municipality}, ${user?.province}`}
            </div>
          </div>
        </div>

        <Separator className="bg-gray-800" />

        {/* MENU */}
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.path} to={item.path} className="no-underline">
                  {({ isActive }) => (
                    <div
                      className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                        isActive
                          ? "bg-[#1f2937] text-orange-500 font-semibold"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={`transition ${
                          isActive
                            ? "text-orange-500"
                            : "text-gray-400 group-hover:text-white"
                        }`}
                      />
                      {item.name}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </ScrollArea>

        {/* LOGOUT */}
        <div className="p-3 border-t border-gray-800">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 min-h-0 px-2 overflow-y-auto bg-gray-100 text-gray-900">

        {/* TOPBAR */}
        <div className="h-8 px-4">

          {/* MOBILE MENU */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="md:hidden border-0">
                <Menu />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-72 p-0 bg-[#070b18] text-gray-200">

              <div className="p-4 font-bold">Menu</div>
              <Separator className="bg-gray-800" />

              <ScrollArea className="h-full p-3">
                {menu.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink key={item.path} to={item.path} className="no-underline">
                      {({ isActive }) => (
                        <div
                          className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                            isActive
                              ? "bg-[#1f2937] text-orange-500 font-semibold"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          <Icon
                            size={16}
                            className={`transition ${
                              isActive
                                ? "text-orange-500"
                                : "text-gray-400 group-hover:text-white"
                            }`}
                          />
                          {item.name}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* TITLE */}
          {/* <h2 className="font-semibold">
            {menu.find((i) => i.path === location.pathname)?.name || "Dashboard"}
          </h2> */}

          {/* RIGHT */}
          {/* <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400">{formattedTime}</div>
            <Bell className="w-5 h-5" />
          </div> */}
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-h-0 px-md-4 overflow-y-auto ">
          <Outlet />
        </div>

      </div>
    </div>
  );
}