import { useEffect, useState } from "react";
import api from "../../api";

export const useFindCustomerById = (collection, id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collection || !id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/${collection}/${encodeURIComponent(id)}`);
        if (!cancelled) setData(res.data.result);
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.response?.data?.message || "Unable to load the record.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [collection, id]);

  return { data, loading, error };
};
