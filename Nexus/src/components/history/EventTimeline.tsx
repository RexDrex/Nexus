import { motion } from "framer-motion";
import { Clock, MapPin, AlertTriangle, CloudRain, Car, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const events = [
  {
    id: 1,
    time: "Today, 2:45 PM",
    type: "traffic",
    title: "Heavy Traffic on Third Mainland Bridge",
    location: "Third Mainland Bridge",
    severity: "high",
    status: "active",
    description: "Major congestion due to broken down vehicle. Estimated delay: 45 minutes."
  },
  {
    id: 2,
    time: "Today, 1:30 PM",
    type: "flood",
    title: "Flash Flood Warning",
    location: "Lekki-Epe Expressway",
    severity: "medium",
    status: "active",
    description: "Water accumulation after heavy rainfall. Drive with caution."
  },
  {
    id: 3,
    time: "Today, 11:00 AM",
    type: "accident",
    title: "Multi-Vehicle Collision",
    location: "Ikorodu Road, Ketu",
    severity: "high",
    status: "resolved",
    description: "Three vehicles involved. Scene cleared by emergency services."
  },
  {
    id: 4,
    time: "Yesterday, 6:15 PM",
    type: "traffic",
    title: "Rush Hour Congestion",
    location: "Awolowo Road, Ikoyi",
    severity: "medium",
    status: "resolved",
    description: "Standard evening rush hour traffic. Resolved after 2 hours."
  },
  {
    id: 5,
    time: "Yesterday, 3:00 PM",
    type: "flood",
    title: "Street Flooding",
    location: "Allen Avenue, Ikeja",
    severity: "low",
    status: "resolved",
    description: "Minor flooding cleared within 1 hour after rain stopped."
  },
];

const typeIcons = {
  traffic: Car,
  flood: CloudRain,
  accident: AlertTriangle,
};

const EventTimeline = () => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Event Timeline</h3>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {events.map((event, index) => {
            const Icon = typeIcons[event.type as keyof typeof typeIcons] || AlertTriangle;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-12"
              >
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-0 top-2 w-10 h-10 rounded-full flex items-center justify-center z-10",
                  event.status === "active" 
                    ? event.severity === "high" 
                      ? "bg-severity-high/20 border-2 border-severity-high" 
                      : event.severity === "medium"
                        ? "bg-severity-medium/20 border-2 border-severity-medium"
                        : "bg-severity-low/20 border-2 border-severity-low"
                    : "bg-secondary border-2 border-border"
                )}>
                  {event.status === "resolved" ? (
                    <CheckCircle className="w-4 h-4 text-severity-low" />
                  ) : (
                    <Icon className={cn(
                      "w-4 h-4",
                      event.severity === "high" && "text-severity-high",
                      event.severity === "medium" && "text-severity-medium",
                      event.severity === "low" && "text-severity-low"
                    )} />
                  )}
                </div>

                {/* Event card */}
                <div className={cn(
                  "p-4 rounded-xl border transition-all duration-200",
                  event.status === "active" 
                    ? "bg-secondary/50 border-border hover:bg-secondary/70" 
                    : "bg-secondary/30 border-border/50 opacity-70"
                )}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          event.severity === "high" ? "severityHigh" : 
                          event.severity === "medium" ? "severityMedium" : "severityLow"
                        }
                      >
                        {event.severity}
                      </Badge>
                      {event.status === "resolved" && (
                        <Badge variant="severityLow">Resolved</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EventTimeline;
