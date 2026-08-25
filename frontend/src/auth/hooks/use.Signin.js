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
      if (!data.result?.token) {
        throw new Error("The server did not return an authentication token.");
      }

      localStorage.setItem("authToken", data.result.token);
      localStorage.setItem("currentUser", JSON.stringify(data.result.user));
      localStorage.removeItem("token");
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
