import imageCompression from "browser-image-compression";
import axios from "axios";

const compressImage = async (file: File) => {
  const image = await imageCompression(file, {
    maxWidthOrHeight: 1000,
    useWebWorker: true,
  });

  return image;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_AI_BACKEND,
});

export const scanImage = async (file: File) => {
  const image = await compressImage(file);
  const formData = new FormData();
  formData.append("file", file);

  const resp = await api.post<{
    expense: number;
    note: string;
    items?: string[];
  }>("/", formData, {
    headers: {
      Authorization: `Basic ${import.meta.env.VITE_AI_AUTH}`,
    },
  });

  return resp.data;
};

export const scanBulkImage = async (file: File) => {
  const image = await compressImage(file);
  const formData = new FormData();
  formData.append("file", file);

  const resp = await api.post<
    {
      expense: number;
      note: string;
      items?: string[];
    }[]
  >("/bulk", formData, {
    headers: {
      Authorization: `Basic ${import.meta.env.VITE_AI_AUTH}`,
    },
  });

  return resp.data;
};
