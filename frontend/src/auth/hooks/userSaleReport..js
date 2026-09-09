import { useState } from "react";
import api from "../../api";

export const useSaleReport = () => {
 const [isLoading, setIsLoading] = useState(false);
  const fetchReport = async (startDate, endDate) => {
    try{
        setIsLoading(true);
        const response = await api.get("/report/sale", {
          params: { startDate, endDate },
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
