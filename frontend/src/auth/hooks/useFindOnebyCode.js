import { useEffect, useState } from "react";
import api from "../../api";
export const useFindOneByCode = (code, endpoint) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/products/barcode/${encodeURIComponent(code)}`);
                setData(response.data.result);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [code, endpoint]);

    return { data, loading };


}
