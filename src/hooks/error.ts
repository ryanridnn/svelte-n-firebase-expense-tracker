import { writable } from "svelte/store";

export const useError = () => {
  const error = writable<string>("");
  let timeout: any;

  const setError = (message: string, time: number = 5000) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    error.set(message);

    timeout = setTimeout(() => {
      error.set("");
      timeout = null;
    }, time);
  };

  const clearError = () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    error.set("");
  };

  return { error, setError, clearError };
};
