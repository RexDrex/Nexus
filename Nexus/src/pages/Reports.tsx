import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  FileWarning, 
  MapPin, 
  Camera, 
  Send,
  AlertTriangle,
  CloudRain,
  Car,
  Users,
  Zap,
  Loader2,
  CheckCircle,
  X,
  Navigation,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useIncidents } from "@/hooks/useIncidents";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const eventTypes = [
  { id: "traffic", label: "Traffic Incident", icon: Car, color: "text-severity-medium" },
  { id: "flood", label: "Flooding", icon: CloudRain, color: "text-primary" },
  { id: "accident", label: "Accident", icon: AlertTriangle, color: "text-severity-high" },
  { id: "protest", label: "Protest/Roadblock", icon: Users, color: "text-severity-high" },
  { id: "outage", label: "Service Outage", icon: Zap, color: "text-severity-medium" },
];

const Reports = () => {
  const { toast } = useToast();
  const { createIncident } = useIncidents();
  const { coordinates, loading: geoLoading, getCurrentPosition } = useGeolocation();
  
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [severity, setSeverity] = useState([50]);
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impactNotes, setImpactNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validation, setValidation] = useState<any>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSeverityLabel = (value: number) => {
    if (value <= 33) return { label: "Low", color: "text-severity-low", value: "low" };
    if (value <= 66) return { label: "Medium", color: "text-severity-medium", value: "medium" };
    return { label: "High", color: "text-severity-high", value: "high" };
  };

  const handleAutoDetect = async () => {
    try {
      const coords = await getCurrentPosition();
      // Reverse geocode (simplified - in production, use a proper geocoding API)
      setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)} - Lagos`);
      toast({ title: "Location detected", description: "GPS coordinates captured" });
    } catch (err) {
      toast({ 
        title: "Location Error", 
        description: err instanceof Error ? err.message : "Failed to get location",
        variant: "destructive" 
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + mediaFiles.length > 5) {
      toast({ title: "Too many files", description: "Maximum 5 files allowed", variant: "destructive" });
      return;
    }
    setMediaFiles([...mediaFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedType || !location.trim() || !title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setValidation(null);

    try {
      const severityInfo = getSeverityLabel(severity[0]);
      
      // Prepare incident data
      const incidentData = {
        event_type: selectedType,
        severity: severityInfo.value,
        severity_score: severity[0],
        title: title.trim(),
        description: description.trim() || null,
        location_address: location.trim(),
        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null,
        impact_notes: impactNotes.trim() || null,
        media_urls: [],
        status: 'active',
        verified: false,
        ai_confidence: null,
        ai_analysis: null,
      };

      // Validate with AI
      try {
        const { data: validationData } = await supabase.functions.invoke('validate-incident', {
          body: { incident: incidentData },
        });
        
        if (validationData?.validation) {
          setValidation(validationData.validation);
          incidentData.ai_confidence = validationData.validation.confidence;
          incidentData.ai_analysis = validationData.validation.analysis;
        }
      } catch (err) {
        console.warn('AI validation failed:', err);
      }

      // Create incident
      const { error } = await createIncident(incidentData);
      
      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Your report has been received and is being processed.",
      });

      // Reset form
      setSelectedType(null);
      setSeverity([50]);
      setLocation("");
      setTitle("");
      setDescription("");
      setImpactNotes("");
      setMediaFiles([]);
      setValidation(null);
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityInfo = getSeverityLabel(severity[0]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-severity-high/10 border border-severity-high/20">
          <FileWarning className="w-4 h-4 text-severity-high" />
          <span className="text-sm text-severity-high font-medium">Submit Live Incident</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Report an Incident
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Help improve urban intelligence by reporting real-time incidents in Lagos.
        </p>
      </motion.div>

      {/* Event Type Selection */}
      <motion.div 
        className="glass-card p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Label className="text-lg font-semibold">Event Type *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {eventTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 ${
                selectedType === type.id 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-secondary/50 border-border hover:bg-secondary text-foreground"
              }`}
            >
              <type.icon className={`w-6 h-6 ${selectedType === type.id ? "text-primary" : type.color}`} />
              <span className="text-xs font-medium text-center">{type.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Title */}
      <motion.div 
        className="glass-card p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <Label className="text-lg font-semibold">Incident Title *</Label>
        <Input
          placeholder="Brief description of the incident"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </motion.div>

      {/* Severity Slider */}
      <motion.div 
        className="glass-card p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Severity Level</Label>
          <span className={`font-semibold ${severityInfo.color}`}>
            {severityInfo.label}
          </span>
        </div>
        <Slider
          value={severity}
          onValueChange={setSeverity}
          max={100}
          step={1}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </motion.div>

      {/* Location */}
      <motion.div 
        className="glass-card p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Label className="text-lg font-semibold">Location *</Label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Enter location or address"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={handleAutoDetect} disabled={geoLoading}>
            {geoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Auto-detect
              </>
            )}
          </Button>
        </div>
        {coordinates && (
          <p className="text-xs text-muted-foreground">
            GPS: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
          </p>
        )}
      </motion.div>

      {/* Description */}
      <motion.div 
        className="glass-card p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Label className="text-lg font-semibold">Description</Label>
        <Textarea
          placeholder="Describe the incident in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </motion.div>

      {/* Impact Notes */}
      <motion.div 
        className="glass-card p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.27 }}
      >
        <Label className="text-lg font-semibold">Impact & Recommended Actions</Label>
        <Textarea
          placeholder="Describe the impact and any recommended actions..."
          value={impactNotes}
          onChange={(e) => setImpactNotes(e.target.value)}
          className="min-h-[80px] resize-none"
        />
      </motion.div>

      {/* Media Upload */}
      <motion.div 
        className="glass-card p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Label className="text-lg font-semibold">Media (Optional)</Label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/*"
          multiple
          className="hidden"
        />
        <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
          <Camera className="w-4 h-4 mr-2" />
          Attach Photos or Videos
        </Button>
        {mediaFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mediaFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1 rounded bg-secondary/50 text-sm">
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* AI Validation Result */}
      {validation && (
        <motion.div 
          className="glass-card p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Validation</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Confidence</p>
              <p className="text-lg font-semibold text-foreground">{validation.confidence}%</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Impact</p>
              <Badge variant={validation.impact === 'high' ? 'severityHigh' : validation.impact === 'medium' ? 'severityMedium' : 'severityLow'}>
                {validation.impact}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{validation.analysis}</p>
          {validation.isDuplicate && (
            <Badge variant="outline" className="text-severity-medium">
              Similar reports detected in area
            </Badge>
          )}
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Button 
          variant="glow" 
          size="lg" 
          className="w-full h-14 text-lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Validating & Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Report
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default Reports;
