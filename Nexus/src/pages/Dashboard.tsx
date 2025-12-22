import { motion } from "framer-motion";
import { AlertTriangle, CloudRain, Car, TrendingUp, TrendingDown, Clock, MapPin, Sparkles, Sun, Droplets, Wind, Cloud, RefreshCw, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWeather } from "@/hooks/useWeather";
import { useTraffic } from "@/hooks/useTraffic";
import { useIncidents } from "@/hooks/useIncidents";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const getWeatherIcon = (icon: string) => {
  if (icon?.includes('01') || icon?.includes('02')) return Sun;
  if (icon?.includes('09') || icon?.includes('10')) return CloudRain;
  return Cloud;
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'traffic': return Car;
    case 'flood': return CloudRain;
    case 'accident': return AlertTriangle;
    default: return AlertTriangle;
  }
};

const Dashboard = () => {
  const { weather, loading: weatherLoading, refetch: refetchWeather } = useWeather();
  const { traffic, loading: trafficLoading, refetch: refetchTraffic } = useTraffic();
  const { incidents, loading: incidentsLoading } = useIncidents();
  const navigate = useNavigate();

  const activeIncidents = incidents.filter(i => i.status === 'active');
  const highSeverityCount = activeIncidents.filter(i => i.severity === 'high').length;
  const reportsToday = activeIncidents.filter(i => {
    const today = new Date();
    const created = new Date(i.created_at);
    return created.toDateString() === today.toDateString();
  }).length;

  const WeatherIcon = weather ? getWeatherIcon(weather.current.icon) : Sun;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {[
          { title: "Active Incidents", value: activeIncidents.length.toString(), change: highSeverityCount > 0 ? `${highSeverityCount} critical` : "0 critical", trend: highSeverityCount > 0 ? "up" : "neutral", color: "border-l-severity-high" },
          { title: "Traffic Congestion", value: traffic ? `${traffic.congestionLevel}%` : "...", change: traffic ? `${traffic.currentSpeed} km/h` : "Loading", trend: traffic && traffic.congestionLevel > 50 ? "up" : "down", color: "border-l-severity-medium" },
          { title: "Weather Alerts", value: weather && weather.current.rain_probability > 60 ? "1" : "0", change: weather ? weather.current.description : "Loading", trend: "neutral", color: "border-l-severity-low" },
          { title: "Reports Today", value: reportsToday.toString(), change: `${activeIncidents.length} total active`, trend: reportsToday > 5 ? "up" : "neutral", color: "border-l-primary" },
        ].map((stat, i) => (
          <div key={i} className={`glass-card p-4 border-l-4 ${stat.color}`}>
            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-foreground">{stat.value}</span>
              <span className={`flex items-center gap-1 text-xs ${stat.trend === "up" ? "text-severity-high" : stat.trend === "down" ? "text-severity-low" : "text-muted-foreground"}`}>
                {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : stat.trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map / Incidents List */}
        <motion.div 
          className="lg:col-span-2 glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Live Incidents - Lagos</h3>
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Live
            </Badge>
          </div>
          
          {incidentsLoading ? (
            <div className="h-[400px] rounded-lg bg-secondary/50 flex items-center justify-center border border-border">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading incidents...</p>
              </div>
            </div>
          ) : activeIncidents.length === 0 ? (
            <div className="h-[400px] rounded-lg bg-secondary/50 flex items-center justify-center border border-border">
              <div className="text-center space-y-2">
                <MapPin className="w-12 h-12 text-primary mx-auto" />
                <p className="text-muted-foreground">No active incidents</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
                  Report an Incident
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {activeIncidents.slice(0, 8).map((incident, i) => {
                const Icon = getEventIcon(incident.event_type);
                return (
                  <motion.div 
                    key={incident.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 rounded-xl border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer ${
                      incident.severity === "high" ? "border-severity-high/30" : incident.severity === "medium" ? "border-severity-medium/30" : "border-severity-low/30"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        incident.severity === "high" ? "bg-severity-high/20" : incident.severity === "medium" ? "bg-severity-medium/20" : "bg-severity-low/20"
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          incident.severity === "high" ? "text-severity-high" : incident.severity === "medium" ? "text-severity-medium" : "text-severity-low"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{incident.title}</h4>
                          <Badge variant={incident.severity === "high" ? "severityHigh" : incident.severity === "medium" ? "severityMedium" : "severityLow"}>
                            {incident.severity}
                          </Badge>
                        </div>
                        {incident.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{incident.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{incident.location_address}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}</span>
                        </div>
                        {incident.ai_confidence && (
                          <div className="mt-2">
                            <span className="text-xs text-primary">AI Confidence: {Math.round(incident.ai_confidence)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Right Sidebar */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Weather Widget */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Weather</h3>
              <Button variant="ghost" size="icon" onClick={refetchWeather} disabled={weatherLoading}>
                <RefreshCw className={`w-4 h-4 ${weatherLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {weatherLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : weather ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                    <WeatherIcon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-foreground">{weather.current.temp}°C</div>
                    <p className="text-sm text-muted-foreground capitalize">{weather.current.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
                    <Droplets className="w-4 h-4 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">Humidity</span>
                    <span className="text-sm font-semibold text-foreground">{weather.current.humidity}%</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
                    <Wind className="w-4 h-4 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">Wind</span>
                    <span className="text-sm font-semibold text-foreground">{weather.current.wind_speed} km/h</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
                    <CloudRain className="w-4 h-4 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">Rain</span>
                    <span className="text-sm font-semibold text-foreground">{weather.current.rain_probability}%</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Unable to load weather</p>
            )}
          </div>

          {/* AI Insights */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">AI Insights</h3>
            </div>
            <div className="space-y-3">
              {traffic && traffic.congestionLevel > 40 && (
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-foreground text-sm">Traffic Congestion</span>
                    <span className="text-xs text-primary">{Math.min(95, traffic.congestionLevel + 10)}% conf.</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current congestion at {traffic.congestionLevel}%. Average speed: {traffic.currentSpeed} km/h.
                  </p>
                </div>
              )}
              {weather && weather.current.rain_probability > 50 && (
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-foreground text-sm">Rain Expected</span>
                    <span className="text-xs text-primary">{weather.current.rain_probability}% prob.</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Consider alternate routes through flood-prone areas.</p>
                </div>
              )}
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-foreground text-sm">Peak Hours Alert</span>
                  <span className="text-xs text-primary">85% conf.</span>
                </div>
                <p className="text-xs text-muted-foreground">Third Mainland Bridge congestion expected to peak at 6 PM.</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/search')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Ask AI Assistant
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/reports')}>
          <AlertTriangle className="w-5 h-5" />
          <span>Report Incident</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/search')}>
          <Sparkles className="w-5 h-5" />
          <span>AI Search</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/history')}>
          <TrendingUp className="w-5 h-5" />
          <span>View Trends</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/profile')}>
          <MapPin className="w-5 h-5" />
          <span>My Locations</span>
        </Button>
      </motion.div>
    </div>
  );
};

export default Dashboard;
