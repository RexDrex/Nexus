import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, ArrowRight, MapPin, Bell, Brain, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: MapPin, title: "Real-Time Tracking", description: "Live traffic, weather, and incident monitoring across Lagos" },
  { icon: Brain, title: "AI-Powered Insights", description: "Get intelligent predictions and recommendations" },
  { icon: Bell, title: "Instant Alerts", description: "Receive notifications for events that matter to you" },
  { icon: Shield, title: "Community Reports", description: "Report incidents and help your community stay informed" },
  { icon: TrendingUp, title: "Historical Trends", description: "Analyze patterns and predict future conditions" },
  { icon: Users, title: "Collaborative", description: "Join thousands of users improving urban intelligence" },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-pattern fixed inset-0 pointer-events-none opacity-30" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Nexus</span>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link to="/">
                <Button variant="glow">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="glow">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 container mx-auto px-4 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm text-primary font-medium">Live Urban Intelligence</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Your AI-Powered <span className="text-gradient">Urban Assistant</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Real-time traffic, weather, incidents, and AI predictions for Lagos. Make smarter decisions with actionable urban intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/" : "/auth"}>
              <Button variant="glow" size="lg" className="text-lg px-8">
                {user ? "Open Dashboard" : "Get Started Free"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Try AI Search
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-card p-6 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 Nexus. Urban Intelligence for Lagos.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
