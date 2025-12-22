import { useState, useEffect } from "react";
import { Bell, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/search": "AI Search",
  "/reports": "Submit Report",
  "/history": "History & Trends",
  "/profile": "Profile",
  "/home": "Home",
  "/auth": "Authentication",
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const pageTitle = pageTitles[location.pathname] || "Nexus";

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Load notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setNotifications(data || []);
    };

    loadNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border flex items-center justify-between px-6">
      {/* Page title and breadcrumb */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
          <Clock className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Location indicator */}
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Lagos, Nigeria</span>
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-severity-high rounded-full text-[10px] flex items-center justify-center text-foreground font-bold">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b border-border">
              <h4 className="font-semibold text-foreground">Notifications</h4>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`w-full text-left p-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Current time */}
        <div className="hidden lg:block text-sm font-mono text-muted-foreground">
          {currentTime.toLocaleTimeString("en-NG", { 
            hour: "2-digit", 
            minute: "2-digit",
            hour12: true 
          })}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
