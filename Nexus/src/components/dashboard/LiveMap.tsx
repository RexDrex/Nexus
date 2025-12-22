import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import { Badge } from "@/components/ui/badge";
import "leaflet/dist/leaflet.css";

// Lagos coordinates
const LAGOS_CENTER: LatLngExpression = [6.5244, 3.3792];

// Mock incident markers
const incidents = [
  { id: 1, position: [6.4550, 3.4239] as LatLngExpression, type: "traffic", severity: "high", title: "Heavy Traffic", location: "Third Mainland Bridge" },
  { id: 2, position: [6.4698, 3.5852] as LatLngExpression, type: "flood", severity: "medium", title: "Flood Warning", location: "Lekki-Epe Expressway" },
  { id: 3, position: [6.5355, 3.3087] as LatLngExpression, type: "traffic", severity: "medium", title: "Slow Traffic", location: "Ikeja Along" },
  { id: 4, position: [6.4281, 3.4219] as LatLngExpression, type: "accident", severity: "high", title: "Road Accident", location: "Victoria Island" },
  { id: 5, position: [6.5959, 3.3420] as LatLngExpression, type: "outage", severity: "low", title: "Power Outage", location: "Ikeja GRA" },
];

const severityColors = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

// Custom marker icons
const createCustomIcon = (severity: string) => new Icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="${severityColors[severity as keyof typeof severityColors]}" opacity="0.9"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  `)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Map controller component
const MapController = () => {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return null;
};

const LiveMap = () => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Live Incident Map</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-severity-high" />
            <span className="text-xs text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-severity-medium" />
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-severity-low" />
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
        </div>
      </div>
      <div className="h-[400px] relative">
        <MapContainer
          center={LAGOS_CENTER}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <MapController />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {incidents.map((incident) => (
            <Marker 
              key={incident.id} 
              position={incident.position}
              icon={createCustomIcon(incident.severity)}
            >
              <Popup className="custom-popup">
                <div className="p-2">
                  <h4 className="font-semibold text-foreground">{incident.title}</h4>
                  <p className="text-sm text-muted-foreground">{incident.location}</p>
                  <Badge 
                    className="mt-2"
                    variant={
                      incident.severity === "high" ? "severityHigh" : 
                      incident.severity === "medium" ? "severityMedium" : "severityLow"
                    }
                  >
                    {incident.severity}
                  </Badge>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Congestion zones */}
          <Circle
            center={[6.4550, 3.4239]}
            radius={1500}
            pathOptions={{ 
              color: severityColors.high, 
              fillColor: severityColors.high, 
              fillOpacity: 0.1,
              weight: 2
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveMap;
