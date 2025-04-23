
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidUrl(string: string | null): boolean {
  if (!string) return false;
  
  // Verificar se é um caminho de rede SMB/CIFS
  if (string.startsWith('//') || string.startsWith('smb://')) {
    return true;
  }
  
  // Verificar se é uma URL HTTP/HTTPS
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
