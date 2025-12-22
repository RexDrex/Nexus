import { BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", incidents: 24, resolved: 22 },
  { day: "Tue", incidents: 32, resolved: 28 },
  { day: "Wed", incidents: 28, resolved: 26 },
  { day: "Thu", incidents: 45, resolved: 40 },
  { day: "Fri", incidents: 38, resolved: 35 },
  { day: "Sat", incidents: 18, resolved: 17 },
  { day: "Sun", incidents: 12, resolved: 12 },
];

const TrendChart = () => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Weekly Incident Trends</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Incidents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-severity-low" />
            <span className="text-muted-foreground">Resolved</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(222, 47%, 10%)", 
                border: "1px solid hsl(217, 33%, 17%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 98%)"
              }}
            />
            <Area
              type="monotone"
              dataKey="incidents"
              stroke="hsl(199, 89%, 48%)"
              strokeWidth={2}
              fill="url(#incidentGradient)"
            />
            <Area
              type="monotone"
              dataKey="resolved"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              fill="url(#resolvedGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
