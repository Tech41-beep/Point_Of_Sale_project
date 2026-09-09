import { useCallback, useState } from "react";
import api from "../../api";

function use30DaysReport() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/report/30days");
      const report = response.data?.result ?? [];

      setData(report);
      return report;
    } catch (err) {
      setData([]);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to fetch the 30-day report.",
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchReport };
}

export default use30DaysReport;
