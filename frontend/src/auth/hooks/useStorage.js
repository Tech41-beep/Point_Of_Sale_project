import { useState } from "react";
import api from "../../api";

export const useStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadFile = async (file, path) => {
    if (!file) {
      throw new Error("A file is required.");
    }

    if (!path) {
      throw new Error("An upload path is required.");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      const uploadPath = encodeURIComponent(path);
      const { data } = await api.post(`/upload/${uploadPath}`, formData);

      return data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = async (filePath) => {
    if (!filePath) {
      throw new Error("A file path is required.");
    }

    try {
      setIsLoading(true);
      const encodedFilePath = encodeURIComponent(filePath);
      const { data } = await api.delete(`/upload/${encodedFilePath}`);

      return data;
    } catch (error) {
      console.error("Error removing file:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadFile, removeFile, isLoading };
};
