import { useState } from "react";
import api from "../../api";

export const useStockReport = () => {
 const [isLoading, setIsLoading] = useState(false);
  const fetchReport = async (Qty) => {
    try{
        setIsLoading(true);
        const response = await api.get("/report/stock", {
          params: { Qty },
        });
        return response.data;
    }catch(error){
        throw error;
    }finally{
        setIsLoading(false);
    }
  }
  return { fetchReport, isLoading };
}
