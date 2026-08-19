import { useEffect } from "react";

export const useQuery = async (collectioname, page, limit, search) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/${collectioname}`, {
          params: {
            page,
            limit,
            search,
          },
        });
        setData(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setData([]);
        setLoading(false);
      }
    };
  }, []);
  return (data, loading);
};
