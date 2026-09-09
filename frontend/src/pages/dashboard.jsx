import { useEffect } from "react";
import useGeneralReport from "../auth/hooks/useGeneralReport";
import Rechart from "../components/Rechart";
import CustomizeCustomElement from "../components/CustomElement";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function Dashboard() {
  const {
    data,
    fetchReport,
    isLoading,
    error,
  } = useGeneralReport();

  useEffect(() => {
    const today = new Date();
    const monday = new Date(today);

    monday.setDate(
      today.getDate() - ((today.getDay() + 6) % 7),
    );

    fetchReport(formatDate(monday), formatDate(today));
  }, [fetchReport]);

  const report = data?.totalSales;

  const stats = [
    {
      label: "Weekly Revenue",
      value: formatMoney(report?.totalSales),
      description: "This week",
      icon: "↗",
    },
      {
      label: "Monthly Revenue",
      value: formatMoney(report?.totalSales),
      description: "This month",
      icon: "↗",
    },

    {
      label: "Due Invoice",
      value: formatMoney(report?.dueSale),
      description: "Awaiting payment",
      icon: "▣",
    },
    {
      label: "Due Purchase",
      value: formatMoney(report?.duePurchase),
      description: "Awaiting payment",
      icon: "◇",
    },
    {
      label: "Total Sales",
      value: report?.monthlyLength ?? 0,
      description: "Transactions this week",
      icon: "▥",
    },
      {
      label: "Total Customers",
      value: report?.totalCustomerCount ?? 0,
      description: "Registered customers",
      icon: "◉",
    },
    {
      label: "Total Suppliers",
      value: report?.totalSupplierCount ?? 0,
      description: "Registered suppliers",
      icon: "◈",
    },
  ];

  return (
    <>
    <h1 className="text-start mb-4 text-xl"><strong> Dashboard </strong></h1>

      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      <section className="stats-grid">
        {stats.map((stat, index) => (
          <article
            className={`stat-card stat-card--${index + 1}`}
            key={stat.label}
          >
            <div className="stat-icon">{stat.icon}</div>
            <span>{stat.label}</span>

            <strong>
              {isLoading ? "..." : stat.value}
            </strong>

            <small>{stat.description}</small>
          </article>
         
        ))}

      </section>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Rechart />
        <CustomizeCustomElement />
      </div>
    </>
  );
}
