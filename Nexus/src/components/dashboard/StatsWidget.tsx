import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsWidgetProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  severity?: "high" | "medium" | "low" | "neutral";
}

const StatsWidget = ({ title, value, change, trend, severity = "neutral" }: StatsWidgetProps) => {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  
  const severityStyles = {
    high: "border-l-severity-high shadow-glow-high/20",
    medium: "border-l-severity-medium shadow-glow-medium/20",
    low: "border-l-severity-low shadow-glow-low/20",
    neutral: "border-l-primary",
  };

  const trendColors = {
    up: "text-severity-low",
    down: "text-severity-high",
    neutral: "text-muted-foreground",
  };

  return (
    <motion.div 
      className={cn(
        "glass-card p-4 border-l-4 transition-all duration-300 hover:scale-[1.02]",
        severityStyles[severity]
      )}
      whileHover={{ y: -2 }}
    >
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <div className={cn("flex items-center gap-1 text-sm font-medium", trendColors[trend])}>
          <TrendIcon className="w-4 h-4" />
          <span>{change}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsWidget;
