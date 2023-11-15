import { useState, useEffect } from "react";

function getStorageValue(key: str, defaultValue: str) {
  // getting stored value
  const saved = localStorage.getItem(key);
  const initial = JSON.parse(saved);
  return initial || defaultValue;
}

const getLocalStorageValue = (key: string, defaultValue: string) => {
  const storageValue = localStorage.getItem(key);
  const value = JSON.parse(storageValue);
  return;
};

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
