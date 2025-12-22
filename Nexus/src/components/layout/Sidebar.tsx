import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Search, 
  FileWarning, 
  TrendingUp, 
  User,
  Zap,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/search", icon: Search, label: "AI Search" },
  { path: "/reports", icon: FileWarning, label: "Reports" },
  { path: "/history", icon: TrendingUp, label: "History" },
  { path: "/profile", icon: User, label: "Profile" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-20 lg:w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-sidebar-border">
        <NavLink to="/home" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="hidden lg:block text-xl font-bold text-foreground">
            Nexus
          </span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 lg:px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
                    "hover:bg-sidebar-accent",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-primary" 
                      : "text-sidebar-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-foreground"
                  )} />
                  <span className={cn(
                    "hidden lg:block font-medium transition-colors",
                    isActive ? "text-foreground" : "group-hover:text-foreground"
                  )}>
                    {item.label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Live status indicator */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-severity-low animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-severity-low animate-ping opacity-75" />
          </div>
          <span className="hidden lg:block text-xs text-muted-foreground">
            System Online
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
