import { useState, useCallback } from "react";
import { C } from "../constants/theme";

export function useToast() {
  const [toast, setToast] = useState(null);

  const show = useCallback((msg, color = C.green) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return { toast, show };
}
