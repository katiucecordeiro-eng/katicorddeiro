"use client";

import { useEffect } from "react";

export function AutoPrint() {
  useEffect(() => {
    const temporizador = setTimeout(() => window.print(), 400);
    return () => clearTimeout(temporizador);
  }, []);

  return null;
}
