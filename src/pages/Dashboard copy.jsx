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

export default function Dashboard() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({});
  const [incidentTrend, setIncidentTrend] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [ageData, setAgeData] = useState([]);

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

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
      setIncidentTrend(data.incident_trend || []);
      setGenderData(data.gender_distribution || []);
      setAgeData(data.age_distribution || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { label: "Residents", value: stats.residents, icon: "bi-people-fill", color: "#3b82f6" },
    { label: "Voters", value: stats.voters, icon: "bi-person-badge-fill", color: "#2563eb" },
    { label: "Male", value: stats.male, icon: "bi-gender-male", color: "#0ea5e9" },
    { label: "Female", value: stats.female, icon: "bi-gender-female", color: "#ec4899" },
    { label: "Blotters", value: stats.blotters, icon: "bi-journal-text", color: "#f59e0b" },
    { label: "Concerns", value: stats.concerns, icon: "bi-chat-dots-fill", color: "#f97316" },
    { label: "Certificates", value: stats.certificates, icon: "bi-award-fill", color: "#10b981" },
    { label: "App Users", value: stats.app_users, icon: "bi-phone-fill", color: "#6366f1" },
    { label: "Ordinances", value: stats.ordinances, icon: "bi-file-earmark-text-fill", color: "#64748b" },
    { label: "Incidents", value: stats.incidents, icon: "bi-exclamation-triangle-fill", color: "#ef4444" },
  ];
  return (
    <div style={styles.container}>

      {/* HEADER (soft, professional) */}
      <div style={styles.header}>
        <h2 style={styles.title}>Barangay Operations Dashboard</h2>
        <p style={styles.subtitle}>
          Real-time monitoring of residents, incidents, and community services
        </p>
      </div>

      {/* STATS */}
      <div style={styles.grid}>
        {cards.map((c, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.iconWrap}>
              <i className={`bi ${c.icon}`} style={{ color: c.color }}></i>
            </div>

            <div>
              <div style={styles.label}>{c.label}</div>
              <div style={styles.value}>{c.value || 0}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div style={styles.chartGrid}>

        {/* INCIDENT TREND */}
        <div style={styles.cardBox}>
          <h3>Incident Reports Trend</h3>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={incidentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* GENDER */}
        <div style={styles.cardBox}>
          <h3>Population Gender</h3>

          <ResponsiveContainer width="100%" height={280}>
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
        <div style={styles.cardBoxFull}>
          <h3>Age Distribution</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

/* ================= LIGHT PROFESSIONAL STYLE ================= */
const styles = {
  container: {
    background: "#f5f7fb",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "system-ui, sans-serif",
    color: "#111827",
  },

  header: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    padding: "18px",
    borderRadius: "14px",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
  },

  subtitle: {
    marginTop: "5px",
    fontSize: "13px",
    color: "#6b7280",
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
  },

  label: {
    fontSize: "12px",
    color: "#6b7280",
  },

  value: {
    fontSize: "22px",
    fontWeight: "700",
    marginTop: "5px",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "15px",
  },

  cardBox: {
    background: "#ffffff",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  cardBoxFull: {
    gridColumn: "1 / -1",
    background: "#ffffff",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  iconWrap: {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    borderRadius: "10px",
    fontSize: "18px",
  },
};