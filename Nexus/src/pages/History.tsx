import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Filter, MapPin, Clock, AlertTriangle, CloudRain, Car, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format, subDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Incident {
  id: string;
  event_type: string;
  severity: string;
  title: string;
  description: string | null;
  location_address: string;
  created_at: string;
  ai_confidence: number | null;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'traffic': return Car;
    case 'flood': return CloudRain;
    case 'accident': return AlertTriangle;
    default: return AlertTriangle;
  }
};

const History = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("7");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const startDate = subDays(new Date(), parseInt(dateFilter)).toISOString();
        
        let query = supabase
          .from('incidents')
          .select('*')
          .gte('created_at', startDate)
          .order('created_at', { ascending: false });

        if (typeFilter !== 'all') {
          query = query.eq('event_type', typeFilter);
        }

        const { data, error } = await query;
        if (error) throw error;
        setIncidents(data || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, [dateFilter, typeFilter]);

  // Calculate stats
  const totalIncidents = incidents.length;
  const resolvedCount = incidents.filter(i => i.severity !== 'high').length;
  const avgConfidence = incidents.filter(i => i.ai_confidence).reduce((acc, i) => acc + (i.ai_confidence || 0), 0) / Math.max(incidents.filter(i => i.ai_confidence).length, 1);

  // Group by date
  const groupedByDate = incidents.reduce((acc, incident) => {
    const date = format(new Date(incident.created_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(incident);
    return acc;
  }, {} as Record<string, Incident[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground">History & Trends</h2>
          <p className="text-muted-foreground">Analyze patterns and predictions</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="traffic">Traffic</SelectItem>
              <SelectItem value="flood">Flooding</SelectItem>
              <SelectItem value="accident">Accidents</SelectItem>
              <SelectItem value="protest">Protests</SelectItem>
              <SelectItem value="outage">Outages</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: "Total Incidents", value: totalIncidents.toString(), change: `in ${dateFilter} days` },
          { label: "By Type", value: typeFilter === 'all' ? 'All' : typeFilter, change: `${incidents.filter(i => i.event_type === typeFilter).length} found` },
          { label: "High Severity", value: incidents.filter(i => i.severity === 'high').length.toString(), change: "critical incidents" },
          { label: "AI Accuracy", value: `${Math.round(avgConfidence)}%`, change: "avg confidence" },
        ].map((stat, index) => (
          <div key={index} className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.change}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Timeline */}
      <motion.div 
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-semibold text-foreground mb-6">Incident Timeline</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No incidents found for this period</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByDate).map(([date, dayIncidents]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </span>
                  <Badge variant="outline">{dayIncidents.length} incidents</Badge>
                </div>
                <div className="ml-6 space-y-3 border-l-2 border-border pl-6">
                  {dayIncidents.map((incident, i) => {
                    const Icon = getEventIcon(incident.event_type);
                    return (
                      <motion.div
                        key={incident.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-4 rounded-lg border bg-secondary/30 ${
                          incident.severity === 'high' ? 'border-severity-high/30' : 
                          incident.severity === 'medium' ? 'border-severity-medium/30' : 'border-severity-low/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            incident.severity === 'high' ? 'bg-severity-high/20' : 
                            incident.severity === 'medium' ? 'bg-severity-medium/20' : 'bg-severity-low/20'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              incident.severity === 'high' ? 'text-severity-high' : 
                              incident.severity === 'medium' ? 'text-severity-medium' : 'text-severity-low'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-medium text-foreground">{incident.title}</h4>
                              <Badge variant={
                                incident.severity === 'high' ? 'severityHigh' : 
                                incident.severity === 'medium' ? 'severityMedium' : 'severityLow'
                              }>
                                {incident.severity}
                              </Badge>
                            </div>
                            {incident.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{incident.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {incident.location_address}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(incident.created_at), 'h:mm a')}
                              </span>
                              {incident.ai_confidence && (
                                <span className="text-primary">
                                  {Math.round(incident.ai_confidence)}% AI conf.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* AI Predictions */}
      <motion.div 
        className="glass-card p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Predictions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              event: "Heavy Traffic Expected", 
              location: "Third Mainland Bridge",
              probability: 85,
              time: "Tomorrow 7-9 AM"
            },
            { 
              event: "Flood Risk", 
              location: "Lekki-Epe Expressway",
              probability: 62,
              time: "Next 48 hours"
            },
            { 
              event: "Power Outage Likely", 
              location: "Ikeja GRA",
              probability: 45,
              time: "This week"
            },
          ].map((prediction, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg bg-secondary/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground text-sm">{prediction.event}</span>
                <Badge 
                  variant={prediction.probability > 70 ? "severityHigh" : prediction.probability > 50 ? "severityMedium" : "severityLow"}
                >
                  {prediction.probability}%
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{prediction.location}</span>
              </div>
              <p className="text-xs text-muted-foreground">{prediction.time}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default History;
