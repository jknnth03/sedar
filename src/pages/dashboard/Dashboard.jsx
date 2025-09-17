import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LabelList,
  ComposedChart,
} from "recharts";
import {
  Users,
  UserCheck,
  TrendingUp,
  Building,
  Activity,
  RefreshCw,
} from "lucide-react";

const DashboardLayoutNavigationActions = () => {
  return null;
};

const SEDARDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [teamData, setTeamData] = useState([
    {
      name: "AMCORE MANPOWER SERVICES",
      value: 450,
      color: "#4F46E5",
      percentage: 39,
    },
    { name: "RDF COMPANY", value: 320, color: "#374151", percentage: 28 },
    {
      name: "OPTIONPLUS SERVICES AND TRADING CORPORATION",
      value: 180,
      color: "#10B981",
      percentage: 16,
    },
    {
      name: "CLEANEDGE MANPOWER SERVICES",
      value: 120,
      color: "#F59E0B",
      percentage: 10,
    },
    { name: "CARA JOB SOLUTIONS", value: 85, color: "#EF4444", percentage: 7 },
    { name: "ARCHER AGENCY", value: 50, color: "#8B5CF6", percentage: 4 },
  ]);

  const [genderData, setGenderData] = useState([
    { name: "Male", value: 748, color: "#4F46E5", percentage: 65 },
    { name: "Female", value: 407, color: "#EC4899", percentage: 35 },
  ]);

  const [ageDistribution, setAgeDistribution] = useState([
    { age: "15-19", male: -45, female: 38, total: 83 },
    { age: "20-24", male: -307, female: 181, total: 488 },
    { age: "25-29", male: -95, female: 78, total: 173 },
    { age: "30-34", male: -125, female: 88, total: 213 },
    { age: "35-39", male: -142, female: 95, total: 237 },
    { age: "40-44", male: -98, female: 72, total: 170 },
    { age: "45-49", male: -75, female: 48, total: 123 },
    { age: "50-54", male: -52, female: 28, total: 80 },
    { age: "55-59", male: -32, female: 18, total: 50 },
    { age: "60-64", male: -12, female: 8, total: 20 },
    { age: "65-69", male: -4, female: 2, total: 6 },
    { age: "70-74", male: -2, female: 1, total: 3 },
    { age: "75-79", male: -1, female: 0, total: 1 },
    { age: "80-84", male: 0, female: 1, total: 1 },
    { age: "85+", male: -1, female: 0, total: 1 },
  ]);

  const stats = [
    {
      title: "Total Employees",
      value: "1,155",
      change: "+12%",
      changeType: "positive",
      icon: Users,
      color: "#4F46E5",
      subtitle: "from last month",
    },
    {
      title: "Active Teams",
      value: "5",
      change: "+1",
      changeType: "positive",
      icon: Building,
      color: "#059669",
      subtitle: "from last month",
    },
    {
      title: "Growth Rate",
      value: "8.5%",
      change: "+2.1%",
      changeType: "positive",
      icon: TrendingUp,
      color: "#9333EA",
      subtitle: "from last month",
    },
    {
      title: "Engagement",
      value: "94%",
      change: "+5%",
      changeType: "positive",
      icon: Activity,
      color: "#F59E0B",
      subtitle: "from last month",
    },
  ];

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTeamData((prev) =>
        prev.map((item) => ({
          ...item,
          value: Math.max(50, item.value + Math.floor(Math.random() * 40 - 20)),
        }))
      );
      setIsLoading(false);
    }, 1500);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "12px",
            boxShadow:
              "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            border: "1px solid #e5e7eb",
          }}>
          <p
            style={{
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px",
            }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                color: entry.color,
              }}>
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: entry.color,
                  marginRight: "8px",
                }}></span>
              {entry.dataKey === "total"
                ? `Total: ${entry.value}`
                : `${entry.dataKey}: ${Math.abs(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderTeamLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    name,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500">
        {name.toUpperCase()}
      </text>
    );
  };

  const renderGenderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#111827"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="16"
        fontWeight="600">
        {value}
      </text>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "16px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: "#f8fafc",
        overflowY: "auto",
      }}>
      <DashboardLayoutNavigationActions />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow:
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                border: "1px solid #f3f4f6",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
              }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}>
                    <div
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: stat.color,
                        marginRight: "12px",
                      }}>
                      <Icon size={18} color="white" />
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#6b7280",
                        margin: 0,
                      }}>
                      {stat.title}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      color: "#111827",
                      margin: "0 0 8px 0",
                    }}>
                    {stat.value}
                  </p>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color:
                          stat.changeType === "positive"
                            ? "#059669"
                            : "#dc2626",
                      }}>
                      {stat.change}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginLeft: "4px",
                      }}>
                      {stat.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "32px",
          marginBottom: "32px",
        }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            border: "1px solid #f3f4f6",
          }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}>
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: "0 0 4px 0",
                }}>
                Employee Count per Team
              </h3>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                This is the count of Active Employee per team.
              </p>
            </div>
            <button
              onClick={refreshData}
              disabled={isLoading}
              style={{
                padding: "8px",
                borderRadius: "8px",
                backgroundColor: "#f3f4f6",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                opacity: isLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) =>
                !isLoading && (e.target.style.backgroundColor = "#e5e7eb")
              }
              onMouseLeave={(e) =>
                !isLoading && (e.target.style.backgroundColor = "#f3f4f6")
              }>
              <RefreshCw
                size={16}
                color="#6b7280"
                style={{
                  animation: isLoading ? "spin 1s linear infinite" : "none",
                }}
              />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "400px",
            }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teamData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  labelLine={false}
                  label={renderTeamLabel}>
                  {teamData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            border: "1px solid #f3f4f6",
          }}>
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#111827",
                margin: "0 0 4px 0",
              }}>
              Employee Gender Group
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              Gender distribution across all active employees
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  paddingAngle={0}
                  dataKey="value"
                  labelLine={false}
                  label={renderGenderLabel}>
                  {genderData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "32px",
              flexWrap: "wrap",
            }}>
            {genderData.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: item.color,
                    marginRight: "4px",
                  }}></div>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#111827",
                  }}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow:
            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          border: "1px solid #f3f4f6",
          marginBottom: "32px",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}>
          <div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#111827",
                margin: "0 0 4px 0",
              }}>
              Employee Age Group
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              This is the count of Active Employee per Age and Gender group.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "16px",
          }}>
          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#60A5FA",
                  marginRight: "4px",
                }}></div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#111827",
                }}>
                Male
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#374151",
                  marginRight: "4px",
                }}></div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#111827",
                }}>
                Female
              </span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart
            layout="horizontal"
            data={ageDistribution}
            margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(156, 163, 175, 0.2)"
            />
            <XAxis
              type="number"
              domain={[-400, 300]}
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => Math.abs(value)}
            />
            <YAxis
              type="category"
              dataKey="age"
              stroke="#6B7280"
              fontSize={12}
              width={60}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const maleData = payload.find((p) => p.dataKey === "male");
                  const femaleData = payload.find(
                    (p) => p.dataKey === "female"
                  );
                  const totalData = payload.find((p) => p.dataKey === "total");

                  return (
                    <div
                      style={{
                        backgroundColor: "#fff",
                        padding: "12px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        border: "1px solid #e5e7eb",
                        fontSize: "14px",
                      }}>
                      <p style={{ fontWeight: "600", margin: "0 0 8px 0" }}>
                        {label === "20-24"
                          ? "Male, Age: 20-24"
                          : `Age: ${label}`}
                      </p>
                      {label === "20-24" && (
                        <p style={{ margin: "0 0 4px 0", color: "#6B7280" }}>
                          Employee Count: 307
                        </p>
                      )}
                      {maleData && (
                        <p style={{ margin: "0 0 4px 0", color: "#60A5FA" }}>
                          Male: {Math.abs(maleData.value)}
                        </p>
                      )}
                      {femaleData && (
                        <p style={{ margin: "0 0 4px 0", color: "#374151" }}>
                          Female: {Math.abs(femaleData.value)}
                        </p>
                      )}
                      {totalData && (
                        <p style={{ margin: "0", color: "#EF4444" }}>
                          Total: {totalData.value}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="male" fill="#60A5FA" name="Male" />
            <Bar dataKey="female" fill="#374151" name="Female" />
            <Line
              dataKey="total"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
              name="Total"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 500px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 575.98px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 930.98px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SEDARDashboard;
