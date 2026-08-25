import { useState } from "react";
import api from "../../api";

export const useCollection = (collectionName) => {
  const [isLoading, setIsLoading] = useState(false);

  const create = async (data) => {
    try {
      setIsLoading(true);
      const res = await api.post(`/${collectionName}`, data);
      return res.data?.result;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (id, data) => {
    try {
      setIsLoading(true);
      const res = await api.put(`/${collectionName}/${id}`, data);
      return res.data?.result;
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      setIsLoading(true);
      const res = await api.delete(`/${collectionName}/${id}`);
      return res.data?.result;
    }catch(error){
      console.error("Error deleting item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, create, update, remove };
};
