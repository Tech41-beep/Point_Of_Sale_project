import { useState } from "react";
import api from "../../api";

const useSignin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const signin = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });
      return data.result;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to sign in.");
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  return { signin, isLoading, error };
};

export default useSignin;
