import { useCallback, useState } from "react";
import api from "../../api";

function useGeneralReport() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReport = useCallback(async (startDate, endDate) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get("/report", {
                params: { startDate, endDate },
            });
            setData(response.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch the report.");
        } finally {
            setIsLoading(false);
        }
    }, []);
  return { data, isLoading, error, fetchReport };
}

export default useGeneralReport;
