
import React, { useEffect, useState } from "react";
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
  FaBell,
} from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function EstanciaDashboard() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({});
  const [incidentTrend, setIncidentTrend] = useState([]);
  const [liveIncidents, setLiveIncidents] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("https://ajcpisonet.com/api/estancia-dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();
      setStats(data);
      setIncidentTrend(data.incident_trend || []);
      setLiveIncidents(data.live_incidents || []);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { label: "TOTAL", value: stats.incidents || 0, color: "#2563eb" },
    { label: "ACTIVE", value: liveIncidents.length, color: "#ef4444" },
    { label: "FIRE", value: stats.fire || 0, color: "#dc2626" },
    { label: "FLOOD", value: stats.flood || 0, color: "#0284c7" },
    { label: "MEDICAL", value: stats.medical || 0, color: "#16a34a" },
    { label: "CRIME", value: stats.crime || 0, color: "#7c3aed" },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>ESTANCIA MDRRMO COMMAND CENTER</h1>
          <div style={styles.subtitle}>Emergency Operations Center</div>
        </div>

        <div style={styles.live}>
          <FaBell />
          <span>LIVE</span>
          <strong>{time.toLocaleTimeString("en-PH")}</strong>
        </div>
      </div>

      <div style={styles.kpiRow}>
        {cards.map((c) => (
          <div key={c.label} style={{ ...styles.card, borderTop: `4px solid ${c.color}` }}>
            <div style={styles.cardValue}>{c.value}</div>
            <div style={styles.cardLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.main}>
        <div style={styles.mapPanel}>
          <div style={styles.panelTitle}>LIVE INCIDENT MAP</div>
          <MapContainer
            center={[11.4554, 123.1586]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />
            {liveIncidents.map((i) => {
              if (!i.gps_location) return null;
              const [lat, lng] = i.gps_location.split(",").map(Number);
              return (
                <Marker key={i.id} position={[lat, lng]}>
                  <Popup>
                    <b>{i.type}</b>
                    <br />
                    {i.location}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <div style={styles.side}>
          <div style={styles.feedPanel}>
            <div style={styles.panelTitle}>LIVE INCIDENT FEED</div>

            <div style={styles.feed}>
              {liveIncidents.map((i) => (
                <div key={i.id} style={styles.feedItem}>
                  <div>{icon(i.type)}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{i.type}</div>
                    <div>{i.location}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>
                      {i.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.chartPanel}>
        <div style={styles.panelTitle}>INCIDENT TREND</div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={incidentTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="total" stroke="#38bdf8" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function icon(type) {
  switch (type) {
    case "Fire": return <FaFire color="#ef4444" />;
    case "Flood": return <FaWater color="#0ea5e9" />;
    case "Medical": return <FaHeartbeat color="#22c55e" />;
    case "Crime": return <FaShieldAlt color="#a855f7" />;
    default: return <FaCarCrash color="#f59e0b" />;
  }
}

const styles = {
  container:{height:"100vh",background:"#020617",padding:12,color:"#fff"},
  header:{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0f172a",padding:20,borderRadius:16},
  title:{margin:0},
  subtitle:{color:"#94a3b8"},
  live:{display:"flex",gap:10,alignItems:"center"},
  kpiRow:{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12,marginTop:12},
  card:{background:"#0f172a",borderRadius:16,padding:20,textAlign:"center"},
  cardValue:{fontSize:34,fontWeight:700},
  cardLabel:{color:"#94a3b8"},
  main:{display:"grid",gridTemplateColumns:"70% 30%",gap:12,height:"55%",marginTop:12},
  mapPanel:{background:"#0f172a",borderRadius:16,overflow:"hidden"},
  side:{display:"flex"},
  feedPanel:{background:"#0f172a",borderRadius:16,width:"100%"},
  panelTitle:{padding:14,borderBottom:"1px solid #1e293b",fontWeight:700},
  feed:{padding:10,overflowY:"auto",height:"calc(100% - 50px)"},
  feedItem:{display:"flex",gap:10,background:"#111827",padding:10,borderRadius:12,marginBottom:10},
  chartPanel:{height:"25%",marginTop:12,background:"#0f172a",borderRadius:16}
};
