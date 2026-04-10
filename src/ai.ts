import imageCompression from "browser-image-compression";
import axios from "axios";

const compressImage = async (file: File) => {
  const image = await imageCompression(file, {
    maxWidthOrHeight: 1000,
    useWebWorker: true,
  });

  return image;
};

export const scanImage = async (file: File) => {
  const image = await compressImage(file);
  const formData = new FormData();
  formData.append("file", image);

  const resp = await axios.post<{
    expense: number;
    note: string;
    items?: string[];
  }>(import.meta.env.VITE_AI_BACKEND, formData, {
    headers: {
      Authorization: `Basic ${import.meta.env.VITE_AI_AUTH}`,
    },
  });

  return resp.data;
};
