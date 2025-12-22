import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Bell, 
  MapPin, 
  Shield, 
  Save,
  Smartphone,
  Mail,
  Loader2,
  Plus,
  Trash2,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Profile = () => {
  const { toast } = useToast();
  const { profile, savedLocations, loading, updateProfile, addLocation, deleteLocation } = useProfile();
  const { user, signOut } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [primaryLocation, setPrimaryLocation] = useState("");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [highSeverityOnly, setHighSeverityOnly] = useState(false);
  const [severityThreshold, setSeverityThreshold] = useState([50]);
  const [saving, setSaving] = useState(false);
  
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationAddress, setNewLocationAddress] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || user?.email || "");
      setPhone(profile.phone || "");
      setPrimaryLocation(profile.primary_location || "Lagos, Nigeria");
      setPushNotifications(profile.push_notifications);
      setEmailAlerts(profile.email_alerts);
      setHighSeverityOnly(profile.high_severity_only);
      setSeverityThreshold([profile.severity_threshold]);
    }
  }, [profile, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        phone,
        primary_location: primaryLocation,
        push_notifications: pushNotifications,
        email_alerts: emailAlerts,
        high_severity_only: highSeverityOnly,
        severity_threshold: severityThreshold[0],
      });

      if (error) throw error;
      toast({ title: "Settings Saved", description: "Your preferences have been updated." });
    } catch (err) {
      toast({ 
        title: "Save Failed", 
        description: err instanceof Error ? err.message : "Failed to save settings",
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim() || !newLocationAddress.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const { error } = await addLocation({
      name: newLocationName.trim(),
      address: newLocationAddress.trim(),
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Location Added" });
      setNewLocationName("");
      setNewLocationAddress("");
      setDialogOpen(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    const { error } = await deleteLocation(id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Location Removed" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed Out" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        className="glass-card p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{fullName || "User Profile"}</h2>
              <p className="text-muted-foreground">{email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.div>

      {/* Account Information */}
      <motion.div 
        className="glass-card p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Account Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input 
              placeholder="Enter your name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email" 
              value={email}
              disabled
              className="opacity-50"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input 
              placeholder="+234" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Primary Location</Label>
            <Input 
              placeholder="Enter your area" 
              value={primaryLocation}
              onChange={(e) => setPrimaryLocation(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div 
        className="glass-card p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
              </div>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Email Alerts</p>
                <p className="text-sm text-muted-foreground">Get daily digest via email</p>
              </div>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">High Severity Only</p>
                <p className="text-sm text-muted-foreground">Only notify for critical incidents</p>
              </div>
            </div>
            <Switch checked={highSeverityOnly} onCheckedChange={setHighSeverityOnly} />
          </div>
        </div>

        {/* Severity Threshold */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Label>Alert Severity Threshold</Label>
            <span className="text-sm text-muted-foreground">{severityThreshold[0]}%</span>
          </div>
          <Slider
            value={severityThreshold}
            onValueChange={setSeverityThreshold}
            max={100}
            step={5}
          />
          <p className="text-xs text-muted-foreground">
            Only receive alerts above this severity level
          </p>
        </div>
      </motion.div>

      {/* Saved Locations */}
      <motion.div 
        className="glass-card p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Saved Locations</h3>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    placeholder="e.g., Home, Work, Gym"
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input 
                    placeholder="Enter address"
                    value={newLocationAddress}
                    onChange={(e) => setNewLocationAddress(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddLocation} className="w-full">Add Location</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-3">
          {savedLocations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No saved locations yet</p>
          ) : (
            savedLocations.map((location) => (
              <div 
                key={location.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{location.name}</p>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteLocation(location.id)}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-severity-high" />
                </Button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button 
          variant="glow" 
          size="lg" 
          className="w-full" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default Profile;
