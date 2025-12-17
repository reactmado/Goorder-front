// File: src/Pages/Business/BusDashboard.tsx

import { useState, useEffect } from "react";
import "../../styles/BusDashboard.css";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import Navbar from "../../components/navbar copy/Navbar";
import {
  getDashboardData,
  DashboardData,
} from "../../service/BusDashboard_service";


const BusDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Daily");
  const [pointerPosition, setPointerPosition] = useState<string>("");

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Convert API data to chart format
  const getChartData = () => {
    if (!dashboardData) return [];

    let revenueData: { [key: string]: number } = {};

    switch (activeTab) {
      case "Daily":
        revenueData = dashboardData.dailyRevenue;
        break;
      case "Monthly":
        revenueData = dashboardData.monthlyRevenue;
        break;
      case "Yearly":
        revenueData = dashboardData.yearlyRevenue;
        break;
      default:
        revenueData = dashboardData.dailyRevenue;
    }

    return Object.entries(revenueData).map(([name, revenue]) => ({
      name,
      revenue,
    }));
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    const chartData = getChartData();
    if (chartData.length > 0) {
      setPointerPosition(chartData[0].name);
    }
  };

  // Set initial pointer position when data loads
  useEffect(() => {
    if (dashboardData && activeTab) {
      const chartData = getChartData();
      if (chartData.length > 0) {
        setPointerPosition(chartData[0].name);
      }
    }
  }, [dashboardData, activeTab]);

  if (loading) {
    return (
      <div className="dashboardContainer">
       
        <div className="mainContent">
          <Navbar />
          <div className="loadingContainer">
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboardContainer">
     
        <div className="mainContent">
          <Navbar />
          <div className="errorContainer">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const isGrowth = dashboardData && dashboardData.totalRevenue > 0;

  return (
    <div className="dashboardContainer">
      <div className="mainContent">
        <Navbar />

        <div className="metrics" style={{ display: "flex", gap: "20px" }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div className="card" style={{ height: "150px", width: "280px" }}>
              <h4>Total Orders</h4>
              <p>{dashboardData?.totalOrders?.toLocaleString() || 0}</p>
              <span
                className={`success ${isGrowth ? "growthBox" : "declineBox"}`}
              >
                {isGrowth ? (
                  <FiTrendingUp style={{ marginRight: "6px" }} />
                ) : (
                  <FiTrendingDown style={{ marginRight: "6px" }} />
                )}
                Total Orders
              </span>
            </div>

            <div className="card" style={{ height: "150px", width: "280px" }}>
              <h4>Order Requests</h4>
              <p>{dashboardData?.orderRequests?.toLocaleString() || 0}</p>
              <span
                className={`success ${isGrowth ? "growthBox" : "declineBox"}`}
              >
                {isGrowth ? (
                  <FiTrendingUp style={{ marginRight: "6px" }} />
                ) : (
                  <FiTrendingDown style={{ marginRight: "6px" }} />
                )}
                Order Requests
              </span>
            </div>
          </div>

          <div className="revenueSection">
            <div className="chartHeader">
              <h4>
                Total Revenue:{" "}
                {dashboardData?.totalRevenue?.toLocaleString() || 0} LE
              </h4>
              <div className="tabs">
                <button
                  className={activeTab === "Daily" ? "active" : ""}
                  onClick={() => handleTabClick("Daily")}
                >
                  Daily
                </button>
                <button
                  className={activeTab === "Monthly" ? "active" : ""}
                  onClick={() => handleTabClick("Monthly")}
                >
                  Monthly
                </button>
                <button
                  className={activeTab === "Yearly" ? "active" : ""}
                  onClick={() => handleTabClick("Yearly")}
                >
                  Yearly
                </button>
              </div>
            </div>
            {chartData.length > 0 ? (
              <LineChart width={600} height={200} data={chartData}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={3}
                />
                {pointerPosition && (
                  <ReferenceLine
                    x={pointerPosition}
                    stroke="#6b46c1"
                    strokeWidth={4}
                    isFront={true}
                  />
                )}
              </LineChart>
            ) : (
              <div className="noDataMessage">
                <p>
                  No revenue data available for {activeTab.toLowerCase()} view
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="salesSection">
          <h4>Revenue Breakdown</h4>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar
                  dataKey="revenue"
                  fill="#8A5BC6"
                  className="salesChartFill"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="noDataMessage">
              <p>No data available for chart display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusDashboard;
