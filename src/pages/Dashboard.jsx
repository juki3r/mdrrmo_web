import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import {
  FaUsers,
  FaMale,
  FaFemale,
  FaExclamationTriangle,
  FaFileAlt,
  FaIdCard,
  FaMobileAlt,
  FaBalanceScale,
  FaClipboardList,
  FaBell,
  FaFire,
  FaMapMarkedAlt,
  FaCarCrash,
  FaWater,
  FaHeartbeat,
  FaShieldAlt,
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

export default function Dashboard() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({});
  const [incidentTrend, setIncidentTrend] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [liveIncidents, setLiveIncidents] = useState([]);
  const [role, setRole] = useState("");

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

  // ================= FETCH =================
  const fetchDashboard = async () => {
    try {
      const res = await fetch("https://ajcpisonet.com/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      setStats(data);
      setRole(data.role);
      setIncidentTrend(data.incident_trend || []);
      setGenderData(data.gender_distribution || []);
      setAgeData(data.age_distribution || []);

      // OPTIONAL: backend should provide this
      setLiveIncidents(data.live_incidents || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(fetchDashboard, 10000); // 10 sec live
    return () => clearInterval(interval);
  }, []);

  const getIncidentIcon = (type) => {
    switch (type) {
      case "Fire":
        return <FaFire color="#ef4444" />;

      case "Accident":
        return <FaCarCrash color="#2563eb" />;

      case "Flood":
        return <FaWater color="#0ea5e9" />;

      case "Medical":
        return <FaHeartbeat color="#16a34a" />;

      case "Crime":
        return <FaShieldAlt color="#6b7280" />;

      default:
        return <FaExclamationTriangle color="#f59e0b" />;
    }
  };
  const formatNumber = (num) => Number(num || 0).toLocaleString();

  // ================= CARDS =================
  const cards = [
    { label: "Residents", value: formatNumber(stats.residents), icon: <FaUsers /> },
    { label: "Voters", value: formatNumber(stats.voters), icon: <FaIdCard /> },
    { label: "Male", value: formatNumber(stats.male), icon: <FaMale /> },
    { label: "Female", value: formatNumber(stats.female), icon: <FaFemale /> },
    {
      label: "Blotters",
      value: formatNumber(stats.blotters),
      icon: <FaFileAlt />,
      hideFor: ["mdrrmo_admin"],
    },
    {
      label: "Concerns",
      value: formatNumber(stats.concerns),
      icon: <FaFileAlt />,
      hideFor: ["mdrrmo_admin"],
    },

    {
      label: "Certificates",
      value: formatNumber(stats.certificates),
      icon: <FaFileAlt />,
      hideFor: ["mdrrmo_admin"],
    },

    {
      label: "Ordinances",
      value: formatNumber(stats.ordinances),
      icon: <FaFileAlt />,
      hideFor: ["mdrrmo_admin"],
    },
    
  
    { label: "App Users", value: formatNumber(stats.app_users), icon: <FaMobileAlt /> },
    { label: "Incidents", value: formatNumber(stats.incidents), icon: <FaExclamationTriangle /> },
  ];

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2>
            {role === "mdrrmo_admin"
              ? "Municipal Operations Dashboard"
              : "Barangay Operations Dashboard"}
          </h2>
          <p style={styles.subtitle}>
            Real-time monitoring of community safety and services
          </p>
        </div>

        <div style={styles.liveBadge}>
          <FaBell />
          {role === "mdrrmo_admin" ? "MUNICIPAL VIEW" : "BARANGAY VIEW"}
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={styles.grid}>
        {cards.filter(card => !card.hideFor?.includes(role))
          .map((c, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.icon}>{c.icon}</div>
              <div>
                <div style={styles.label}>{c.label}</div>
                <div style={styles.value}>{c.value || 0}</div>
              </div>
            </div>
          ))}
      </div>

      {/* MAIN GRID */}
      <div style={styles.chartGrid}>

        {/* INCIDENT TREND */}
        <div style={styles.box}>
          <h3>📈 Incident Trend</h3>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={incidentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="total" stroke="#ef4444" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* LIVE INCIDENT FEED */}
        <div style={styles.box}>
          <h3 style={{ marginBottom: "10px" }}>🚨 Live Incident Feed</h3>

          <div style={styles.feed}>
            {liveIncidents?.length > 0 ? (
              liveIncidents.map((i, idx) => (
                <div key={idx} style={styles.feedItem}>
                  
                  {/* STATUS DOT */}
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background:
                        i.status === "active"
                          ? "#ef4444"
                          : i.status === "responding"
                          ? "#f59e0b"
                          : "#22c55e",
                      marginTop: 6,
                    }}
                  />

                  {/* ICON */}
                  {getIncidentIcon(i.type)}

                  {/* CONTENT */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "13px" }}>
                      {i.type}
                    </div>
                    <div>
                      <small style={{ color: "#6b7280", fontSize:12 }}>
                        📍 {i.location}
                      </small>
                      </div>
                      {i.gps_location && (
                        <div>
                          <small
                            style={{
                              color: "#2563eb",
                              fontSize: 11,
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              window.open(
                                `https://maps.google.com/?q=${i.gps_location}`,
                                "_blank"
                              )
                            }
                          >
                            🛰️ {i.gps_location}
                          </small>
                        </div>
                      )}
                      <div>
                      <small style={{ color: "#6b7280", fontSize:11 }}>
                        {i.description}
                      </small>
                    </div>

                    {/* TIME */}
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {new Date(i.incident_datetime).toLocaleString()}
                    </div>
                  </div>

                  {/* STATUS BADGE */}
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "3px 8px",
                      borderRadius: "999px",
                      background:
                        i.status === "active"
                          ? "#fee2e2"
                          : i.status === "responding"
                          ? "#fef3c7"
                          : "#dcfce7",
                      color:
                        i.status === "active"
                          ? "#991b1b"
                          : i.status === "responding"
                          ? "#92400e"
                          : "#166534",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    {i.status}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#9ca3af" }}>
                No active incidents
              </div>
            )}
          </div>
        </div>

        {/* MAP PANEL (placeholder for Leaflet/Google Maps) */}
        <div style={styles.fullBox}>
            <h3>📍 Live Incident Map</h3>

            <div style={{ height: 400, borderRadius: 12, overflow: "hidden" }}>
              <MapContainer
                center={[11.596377, 123.149881]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; PONG-MTA I.T Services'
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
          </div>

        {/* GENDER */}
        <div style={styles.box}>
          <h3>👥 Gender Distribution</h3>

          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={genderData} dataKey="value" outerRadius={90} label>
                {genderData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* AGE */}
        <div style={styles.box}>
          <h3>🧓 Age Distribution</h3>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ageData}>
              <CartesianGrid />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

/* ================= LIGHT COMMAND CENTER STYLE ================= */
const styles = {
  container: {
    background: "#f5f7fb",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "system-ui",
  },

  header: {
    background: "#ffffff",
    padding: "18px",
    borderRadius: "14px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
  },

  subtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
  },

  liveBadge: {
    background: "#dcfce7",
    color: "#16a34a",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  card: {
    background: "#ffffff",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  icon: {
    fontSize: "20px",
    color: "#3b82f6",
  },

  label: {
    fontSize: "12px",
    color: "#6b7280",
  },

  value: {
    fontSize: "20px",
    fontWeight: "700",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "15px",
  },

  box: {
    background: "#ffffff",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  fullBox: {
    gridColumn: "1 / -1",
    background: "#ffffff",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  feed: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
    maxHeight: "240px",
    overflowY: "auto",
  },

  feedItem: {
    display: "flex",
    gap: "10px",
    padding: "8px",
    borderRadius: "8px",
    background: "#f9fafb",
  },

  mapPlaceholder: {
    height: "250px",
    border: "2px dashed #cbd5e1",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
  },
  feed: {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginTop: "10px",
  maxHeight: "320px",
  overflowY: "auto",
  paddingRight: "5px",
},

feedItem: {
  display: "flex",
  gap: "10px",
  padding: "10px",
  borderRadius: "10px",
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  alignItems: "flex-start",
},
};