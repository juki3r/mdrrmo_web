import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import {
  FaFire,
  FaWater,
  FaHeartbeat,
  FaShieldAlt,
  FaCarCrash,
  FaExclamationTriangle,
  FaBell,
} from "react-icons/fa";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function EstanciaDashboard() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({});
  const [incidentTrend, setIncidentTrend] = useState([]);
  const [liveIncidents, setLiveIncidents] = useState([]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(
        "https://ajcpisonet.com/api/estancia-dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      setStats(data);
      setIncidentTrend(data.incident_trend || []);
      setLiveIncidents(data.live_incidents || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(fetchDashboard, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const refresh = setInterval(() => {
      window.location.reload();
    }, 300000);

    return () => clearInterval(refresh);
  }, []);

  const redIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const blueIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const greenIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const orangeIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const greyIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const getMarkerIcon = (type) => {
    switch (type) {
      case "Fire":
        return redIcon;

      case "Flood":
        return blueIcon;

      case "Medical":
        return greenIcon;

      case "Accident":
        return orangeIcon;

      case "Crime":
        return greyIcon;

      default:
        return redIcon;
    }
  };

  const getIncidentIcon = (type) => {
    switch (type) {
      case "Fire":
        return <FaFire color="#ef4444" />;

      case "Flood":
        return <FaWater color="#0ea5e9" />;

      case "Medical":
        return <FaHeartbeat color="#16a34a" />;

      case "Crime":
        return <FaShieldAlt color="#6b7280" />;

      case "Accident":
        return <FaCarCrash color="#f59e0b" />;

      default:
        return <FaExclamationTriangle color="#ef4444" />;
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            ESTANCIA MDRRMO COMMAND CENTER
          </h1>

          <p style={styles.subtitle}>
            Real-Time Emergency Monitoring System
          </p>
        </div>

        <div style={styles.liveBadge}>
          <FaBell />
          LIVE
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.layout}>
        {/* MAP */}
        <div style={styles.mapPanel}>
          <div style={styles.panelTitle}>
            📍 LIVE INCIDENT MAP
          </div>

          <MapContainer
            center={[11.455414215231249, 123.15862548238557]}
            zoom={13}
            attributionControl={false}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {liveIncidents.map((incident) => {
              if (!incident.gps_location) return null;

              const [lat, lng] = incident.gps_location
                .split(",")
                .map(Number);

              return (
                <Marker
                  key={incident.id}
                  position={[lat, lng]}
                  icon={getMarkerIcon(incident.type)}
                >
                  <Popup>
                    <strong>{incident.type}</strong>
                    <br />
                    {incident.location}
                    <br />
                    {incident.description}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* FEED */}
        <div style={styles.feedPanel}>
          <div style={styles.counterSection}>
            <div style={styles.counter}>
              <div style={styles.counterValue}>
                {stats.incidents || 0}
              </div>

              <div style={styles.counterLabel}>
                TOTAL INCIDENTS
              </div>
            </div>

            <div style={styles.counter}>
              <div style={styles.counterValue}>
                {liveIncidents.length}
              </div>

              <div style={styles.counterLabel}>
                ACTIVE
              </div>
            </div>
          </div>

          <div style={styles.feedHeader}>
            🚨 LIVE INCIDENT FEED
          </div>

          <div style={styles.feed}>
            {liveIncidents.length > 0 ? (
              liveIncidents.map((incident) => (
                <div
                  key={incident.id}
                  style={styles.feedItem}
                >
                  <div>{getIncidentIcon(incident.type)}</div>

                  <div style={{ flex: 1 }}>
                    <div style={styles.feedType}>
                      {incident.type}
                    </div>

                    <div style={styles.feedLocation}>
                      📍 {incident.location}
                    </div>

                    <div style={styles.feedDesc}>
                      {incident.description}
                    </div>

                    <div style={styles.feedDesc2}>
                      Reported by: {incident.reported_by}
                    </div>
                    <div style={styles.feedDesc}>
                      Contact: {
                        incident.contact_number?.replace(
                          /(\d{4})(\d{3})(\d{4})/,
                          "$1-$2-$3"
                        )
                      }
                    </div>

                    <div style={styles.feedTime}>
                      {new Date(incident.incident_datetime).toLocaleString(
                        "en-PH",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 20 }}>
                No Active Incidents
              </div>
            )}
          </div>
        </div>

        {/* TREND */}
        <div style={styles.trendPanel}>
          <div style={styles.panelTitle}>
            📈 INCIDENT TREND
          </div>

          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart data={incidentTrend}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  }
                />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="total"
                stroke="#ef4444"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "#f3f4f6",
    padding: "10px",
    overflow: "hidden",
  },

  header: {
    height: "60px",
    background: "#fff",
    borderRadius: "12px",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: "24px",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
  },

  liveBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "8px 15px",
    borderRadius: "999px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontWeight: "bold",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gridTemplateRows: "1fr 220px",
    gap: "10px",
    height: "calc(100vh - 110px)",
  },

  mapPanel: {
    background: "#fff",
    bordertopLeftRadius: 0,
    bordertopRightRadius: 0,
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  feedPanel: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  trendPanel: {
    gridColumn: "1 / -1",
    background: "#fff",
    borderRadius: "12px",
    padding: "15px",
  },

  panelTitle: {
    padding: "12px",
    fontWeight: "700",
    borderBottom: "1px solid #e5e7eb",
  },

  counterSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    padding: "10px",
  },

  counter: {
    background: "#111827",
    color: "#fff",
    borderRadius: "12px",
    padding: "15px",
    textAlign: "center",
  },

  counterValue: {
    fontSize: "34px",
    fontWeight: "700",
  },

  counterLabel: {
    fontSize: "12px",
  },

  feedHeader: {
    padding: "12px",
    fontWeight: "700",
    borderTop: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
  },

  feed: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
  },

  feedItem: {
    display: "flex",
    gap: "10px",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "10px",
    background: "#f9fafb",
  },

  feedType: {
    fontWeight: "700",
  },

  feedLocation: {
    fontSize: "12px",
  },

  feedDesc: {
    fontSize: "11px",
    color: "#6b7280",
  },

  feedDesc2: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "10px",
  },

  feedTime: {
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "5px",
  },
};