import { Cloud, Droplets, Wind, Thermometer, Sun } from "lucide-react";

const WeatherWidget = () => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Weather</h3>
        <span className="text-xs text-muted-foreground">Lagos, Nigeria</span>
      </div>

      {/* Main temperature */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
          <Sun className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <div className="text-4xl font-bold text-foreground">32°C</div>
          <p className="text-sm text-muted-foreground">Partly Cloudy</p>
        </div>
      </div>

      {/* Weather details */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
          <Droplets className="w-4 h-4 text-primary mb-1" />
          <span className="text-xs text-muted-foreground">Humidity</span>
          <span className="text-sm font-semibold text-foreground">78%</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
          <Wind className="w-4 h-4 text-primary mb-1" />
          <span className="text-xs text-muted-foreground">Wind</span>
          <span className="text-sm font-semibold text-foreground">12 km/h</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
          <Cloud className="w-4 h-4 text-primary mb-1" />
          <span className="text-xs text-muted-foreground">Rain</span>
          <span className="text-sm font-semibold text-foreground">40%</span>
        </div>
      </div>

      {/* Forecast */}
      <div className="pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Next 3 hours</p>
        <div className="flex justify-between">
          {[
            { time: "4 PM", temp: "33°", icon: Sun },
            { time: "5 PM", temp: "31°", icon: Cloud },
            { time: "6 PM", temp: "29°", icon: Cloud },
          ].map((hour, index) => (
            <div key={index} className="text-center">
              <p className="text-xs text-muted-foreground">{hour.time}</p>
              <hour.icon className="w-4 h-4 text-primary mx-auto my-1" />
              <p className="text-sm font-medium text-foreground">{hour.temp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
