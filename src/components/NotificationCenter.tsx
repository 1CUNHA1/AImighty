import { useEffect, useState } from "react";
import { Bell, Check, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "app_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          toast.success("New Motivation Co-Pilot message received! 🚀");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("app_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching notifications:", error);
      return;
    }
    setNotifications(data || []);
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await supabase.from("app_notifications").update({ is_read: true }).eq("id", id);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("app_notifications").update({ is_read: true }).eq("user_id", user?.id);
  };

  const triggerMotivation = async () => {
    setLoading(true);
    try {
      // In dev mode, we check if there's a VITE_ environment variable to use locally
      const { data, error } = await supabase.functions.invoke("generate-motivation", {
        body: { } 
      });
      if (error) throw error;
      toast.success("Motivation generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate motivation");
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group hover:bg-primary/10">
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary glow-primary border-2 border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-2xl border-primary/20 glass-card bg-background/80 backdrop-blur-xl shadow-2xl mr-4 mt-2">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h4 className="font-semibold font-['Space_Grotesk'] text-sm tracking-wide">Co-Pilot Inbox</h4>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-muted-foreground hover:text-primary hover:bg-transparent">
              Mark all read
            </Button>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto scrollbar-none">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 opacity-20" />
              <p>No messages yet.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-border/50 transition-colors ${
                    notif.is_read ? "opacity-70" : "bg-primary/5"
                  }`}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h5 className={`text-sm font-semibold font-['Space_Grotesk'] ${!notif.is_read ? "text-primary" : ""}`}>
                      {notif.title}
                    </h5>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
