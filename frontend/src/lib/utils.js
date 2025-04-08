import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 

export function formatForInput(value, defaultValue = "") {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return value;
} 