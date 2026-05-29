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
  Legend,
} from "recharts";

export default function Dashboard() {

  // SAMPLE DATA
  const disasterData = [
    { month: "Jan", reports: 12 },
    { month: "Feb", reports: 18 },
    { month: "Mar", reports: 10 },
    { month: "Apr", reports: 25 },
    { month: "May", reports: 20 },
    { month: "Jun", reports: 30 },
  ];

  const evacuationData = [
    { name: "Evacuated", value: 400 },
    { name: "Safe", value: 700 },
  ];

  const barangayData = [
    { barangay: "Poblacion", incidents: 15 },
    { barangay: "San Roque", incidents: 10 },
    { barangay: "Mabini", incidents: 20 },
    { barangay: "Luna", incidents: 8 },
  ];

  const COLORS = ["#ef4444", "#22c55e"];

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f5f7fb", minHeight: "100vh" }}
    >


      {/* CARDS */}
      <div className="row g-4 mb-4">

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3">
            <h6>Total Incidents</h6>
            <h2 className="fw-bold text-danger">125</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3">
            <h6>Evacuated Residents</h6>
            <h2 className="fw-bold text-primary">400</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3">
            <h6>Active Alerts</h6>
            <h2 className="fw-bold text-warning">8</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3">
            <h6>Rescue Teams</h6>
            <h2 className="fw-bold text-success">14</h2>
          </div>
        </div>

      </div>

      {/* CHARTS */}
      <div className="row g-4">

        {/* LINE CHART */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="mb-4">Monthly Disaster Reports</h5>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={disasterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="#ef4444"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="mb-4">Evacuation Status</h5>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={evacuationData}
                  dataKey="value"
                  outerRadius={100}
                  label
                >
                  {evacuationData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="mb-4">Barangay Incident Reports</h5>

            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barangayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="barangay" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="incidents"
                  fill="#07162d"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}