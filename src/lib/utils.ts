import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKey(key: string | null): string {
  if (!key) return "—";
  return key.replace("major", "Mayor").replace("minor", "menor");
}

export function categoryStyle(color: string) {
  return {
    backgroundColor: color + "20",
    color: color,
    borderColor: color + "40",
  };
}
