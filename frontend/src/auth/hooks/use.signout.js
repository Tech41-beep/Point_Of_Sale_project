import { useState } from "react";
import api from "../../api";

const clearSession = () => {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem("authToken");
    storage.removeItem("currentUser");
    storage.removeItem("token");
  });
};

const useSignout = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signout = async () => {
    setIsLoading(true);
    clearSession();
    try {
      await api.post("/auth/logout");
    } finally {
      setIsLoading(false);
    }
  };

  return { signout, isLoading };
};

export default useSignout;
