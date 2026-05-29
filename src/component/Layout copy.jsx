import { Menu } from "lucide-react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";



import {
  LayoutDashboard,
  Bell,
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
} from "lucide-react";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  };

  const user = getUser();
  const role = user?.role;


  const [time, setTime] = useState(new Date());
  const formattedTime = time.toLocaleTimeString();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const mdrrmo = [
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

  const bdrrmo = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Residents", path: "/residents", icon: Users },
    { name: "Certificates", path: "/certificates", icon: Newspaper },
    { name: "Concerns", path: "/concerns", icon: Spotlight },
    { name: "Blotters", path: "/blotters", icon: BookAlert },
    { name: "News", path: "/news", icon: NotebookText },
    { name: "Ordinance", path: "/ordinance", icon: Gavel },
    { name: "Incidents", path: "/incidents", icon: AlertTriangle },
    { name: "Officials", path: "/officials", icon: Users },
    { name: "Calerdar", path: "/calerdar", icon: CalendarDays },
    { name: "Weather", path: "/weather", icon: CloudSun },
    { name: "Sms", path: "/sms", icon: MessagesSquare },
    { name: "E-Contacts", path: "/emergencycontacts", icon: SquareUser },
    { name: "App Users", path: "/appusers", icon: TabletSmartphone },

  
   
  ];

  const menu = role === "bdrrmo_admin" ? bdrrmo : mdrrmo;
  const activeMenu = menu.find(
    (item) => item.path === location.pathname
  );

  

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <div className={`sidebar ${open ? "show" : ""}`}>

        {/* LOGO */}
        <div className="logo d-flex align-items-center gap-2">
          
          <img
              src="/drr2.png"
              alt="Resilient Community Logo"
              style={{
                width: "70px",
                height: "70px",
                objectFit: "contain",
                background: "#f77a05",
                borderRadius: "50%",
              }}
            />

          <div>
            <h4 className="m-0">
              {role === "bdrrmo_admin" ? "BICDP" : "MICDP"}
            </h4>

            <small>
              {role === "bdrrmo_admin"
                ? user?.barangay + ", " + user?.municipality
                : user?.municipality + ", " + user?.province}
            </small>
          </div>

        </div>

        {/* MENU */}
        <div className="menu">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="navlink"
              >
                {({ isActive }) => (
                  <div className={`item ${isActive ? "active" : ""}`}>
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* LOGOUT */}
        <div className="logout">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* OVERLAY (mobile) */}
      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {/* MAIN */}
      <div className="main">

        {/* TOPBAR */}
        <div className="topbar">

          {/* LEFT: Menu + Title */}
          <div className="topbar-left">
            <button
              onClick={() => setOpen(true)}
              className="menu-btn"
            >
              <Menu size={22} color="red" />
            </button>

            <h3>
              {activeMenu?.name || "Dashboard"}
            </h3>
          </div>

          {/* RIGHT: Clock + Bell + User */}
          <div className="topbar-right">

            {/* LIVE CLOCK */}
            <div className="clock">
            {formattedTime}
            </div>

            {/* NOTIFICATION BELL */}
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>

            {/* ADMIN INFO */}
            <div className="admin-info">
              <span className="role">
                {role === "barangay_admin" ? "Barangay Admin" : "Municipal Admin"}
              </span>
            </div>

          </div>
        </div>

        {/* CONTENT */}
        <div className="content">
          <Outlet />
        </div>

      </div>
    </div>
  );
}