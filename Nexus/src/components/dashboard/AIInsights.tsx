import { motion } from "framer-motion";
import { Sparkles, ArrowRight, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const insights = [
  {
    title: "Traffic Building Up",
    description: "Third Mainland Bridge congestion expected to peak at 6 PM. Consider alternative routes via Carter Bridge.",
    confidence: 87,
    type: "warning"
  },
  {
    title: "Flood Risk Tomorrow",
    description: "High rainfall predicted for Lekki axis. 62% chance of localized flooding on low-lying roads.",
    confidence: 62,
    type: "alert"
  },
  {
    title: "Traffic Improving",
    description: "Ikorodu Road incident cleared. Traffic flow returning to normal within 30 minutes.",
    confidence: 94,
    type: "positive"
  },
];

const AIInsights = () => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">AI Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg bg-secondary/50 space-y-2 hover:bg-secondary/70 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-foreground text-sm">{insight.title}</h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="text-primary">{insight.confidence}%</span>
                <span>conf.</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {insight.description}
            </p>
          </motion.div>
        ))}
      </div>

      <Button variant="ghost" className="w-full justify-between group">
        <span>View All Insights</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
};

export default AIInsights;
