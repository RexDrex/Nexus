import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CloudRain, Car, Users, Zap, Clock, MapPin, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "traffic" | "flood" | "accident" | "protest" | "outage";
  title: string;
  location: string;
  severity: "high" | "medium" | "low";
  time: string;
  description: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "traffic",
    title: "Heavy Traffic Reported",
    location: "Third Mainland Bridge",
    severity: "high",
    time: "2 min ago",
    description: "Standstill traffic due to broken down vehicle. Expect 45+ min delay."
  },
  {
    id: "2",
    type: "flood",
    title: "Flood Warning",
    location: "Lekki-Epe Expressway",
    severity: "medium",
    time: "15 min ago",
    description: "Water rising on road surface. Drive with caution."
  },
  {
    id: "3",
    type: "accident",
    title: "Road Accident",
    location: "Ikorodu Road, Ketu",
    severity: "high",
    time: "25 min ago",
    description: "Multi-vehicle collision. Emergency services on scene."
  },
  {
    id: "4",
    type: "outage",
    title: "Power Outage",
    location: "Ikeja GRA",
    severity: "low",
    time: "1 hour ago",
    description: "Scheduled maintenance. Expected restoration by 6 PM."
  },
];

const typeIcons = {
  traffic: Car,
  flood: CloudRain,
  accident: AlertTriangle,
  protest: Users,
  outage: Zap,
};

const AlertsList = () => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Active Alerts</h3>
        <Badge variant="severityHigh" className="animate-pulse">
          {mockAlerts.filter(a => a.severity === "high").length} Critical
        </Badge>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {mockAlerts.map((alert, index) => {
            const Icon = typeIcons[alert.type];
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] cursor-pointer",
                  "bg-secondary/30 hover:bg-secondary/50",
                  alert.severity === "high" && "border-severity-high/30 bg-severity-high/5",
                  alert.severity === "medium" && "border-severity-medium/30 bg-severity-medium/5",
                  alert.severity === "low" && "border-severity-low/30 bg-severity-low/5"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    alert.severity === "high" && "bg-severity-high/20",
                    alert.severity === "medium" && "bg-severity-medium/20",
                    alert.severity === "low" && "bg-severity-low/20"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      alert.severity === "high" && "text-severity-high",
                      alert.severity === "medium" && "text-severity-medium",
                      alert.severity === "low" && "text-severity-low"
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">{alert.title}</h4>
                      <Badge 
                        variant={
                          alert.severity === "high" ? "severityHigh" : 
                          alert.severity === "medium" ? "severityMedium" : "severityLow"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.time}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Button variant="outline" className="w-full">
        View All Alerts
      </Button>
    </div>
  );
};

export default AlertsList;
