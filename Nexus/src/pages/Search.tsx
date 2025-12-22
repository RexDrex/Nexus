import { useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, Sparkles, MapPin, Clock, ArrowRight, Loader2, AlertCircle, TrendingUp, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface AIResponse {
  response: string;
  confidence: number;
  context: {
    weather: any;
    traffic: any;
    incidentCount: number;
  };
  timestamp: string;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  location: string | null;
  ai_response: string | null;
  confidence: number | null;
  created_at: string;
}

const suggestedQueries = [
  "Is Third Mainland Bridge congested now?",
  "Flood risk in Lekki today",
  "Best route from Ikeja to Victoria Island",
  "Any protests or roadblocks in Lagos?",
  "Weather forecast for tomorrow",
  "Traffic on Ikorodu Road",
];

const Search = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load search history
  useState(() => {
    const loadHistory = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('search_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        setSearchHistory(data || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  });

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    
    setIsSearching(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-query', {
        body: { query: q, lat: 6.5244, lon: 3.3792 },
      });

      if (error) throw error;
      setResult(data);

      // Save to history
      if (user) {
        await supabase.from('search_history').insert({
          user_id: user.id,
          query: q,
          location: 'Lagos',
          ai_response: data.response,
          confidence: data.confidence,
        });
      }
    } catch (err) {
      console.error('Search error:', err);
      toast({
        title: "Search Failed",
        description: err instanceof Error ? err.message : "Unable to process your query",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getSeverityFromConfidence = (confidence: number) => {
    if (confidence >= 80) return { color: "text-severity-low", label: "High Confidence" };
    if (confidence >= 60) return { color: "text-severity-medium", label: "Medium Confidence" };
    return { color: "text-severity-high", label: "Low Confidence" };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">AI-Powered Search</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Ask anything about Lagos
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Get real-time intelligence on traffic, weather, incidents, and more with natural language queries.
        </p>
      </motion.div>

      {/* Search Box */}
      <motion.div 
        className="glass-card p-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="e.g., Is there flooding on Lekki-Epe Expressway?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-12 h-14 text-lg bg-transparent border-none focus-visible:ring-0"
            />
          </div>
          <Button 
            variant="glow" 
            size="lg" 
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Search
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Suggested Queries */}
      {!result && (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-muted-foreground">Suggested queries:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch(suggestion);
                }}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Response */}
      {result && (
        <motion.div 
          className="glass-card p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI Analysis</h3>
                <p className="text-xs text-muted-foreground">Based on real-time data</p>
              </div>
            </div>
            <Badge className={getSeverityFromConfidence(result.confidence).color}>
              {result.confidence}% confidence
            </Badge>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="text-foreground whitespace-pre-wrap leading-relaxed">
              {result.response}
            </div>
          </div>

          {/* Context Cards */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
            {result.context.weather && (
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground mb-1">Weather</p>
                <p className="text-sm font-semibold text-foreground">{result.context.weather.temp}°C</p>
                <p className="text-xs text-muted-foreground capitalize">{result.context.weather.description}</p>
              </div>
            )}
            {result.context.traffic && (
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground mb-1">Traffic</p>
                <p className="text-sm font-semibold text-foreground">{result.context.traffic.congestion}%</p>
                <p className="text-xs text-muted-foreground">Congestion</p>
              </div>
            )}
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Incidents</p>
              <p className="text-sm font-semibold text-foreground">{result.context.incidentCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => setResult(null)}>
            Ask Another Question
          </Button>
        </motion.div>
      )}

      {/* Recent Searches */}
      {!result && searchHistory.length > 0 && (
        <motion.div 
          className="glass-card p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold text-foreground">Recent Searches</h3>
          <div className="space-y-3">
            {searchHistory.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setQuery(item.query);
                  handleSearch(item.query);
                }}
                className="w-full flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-secondary/30 rounded-lg px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <SearchIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground text-left">{item.query}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {item.confidence && (
                    <Badge variant="outline" className="text-xs">
                      {item.confidence}%
                    </Badge>
                  )}
                  <span className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Search;
