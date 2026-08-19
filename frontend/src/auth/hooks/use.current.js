import { useCallback, useState } from "react";
import api from "../../api";

export const useCurrentUser = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.result);
      return data.result;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load the current user.");
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { user, getCurrentUser, isLoading, error };
};
