// Historial de sesiones CNV — se guarda solo en este dispositivo (localStorage)

export type SesionCNV = {
  id: string;
  fecha: string; // ISO, ej: 2026-11-20T17:30:00.000Z
  observation: string;
  feelings: string[];
  needs: string[];
  requests: string[];
  mensaje: string; // mensaje generado con IA ("" si no se generó)
};

const KEY = "cnv_historial";
const MAX_SESIONES = 200;

function leerTodo(): SesionCNV[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as SesionCNV[]) : [];
  } catch {
    return [];
  }
}

function escribirTodo(sesiones: SesionCNV[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(sesiones.slice(0, MAX_SESIONES)));
  } catch {
    // Sin espacio o almacenamiento bloqueado: se ignora para no romper la app
  }
}

export function nuevoId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Devuelve las sesiones de la más nueva a la más antigua
export function obtenerHistorial(): SesionCNV[] {
  return leerTodo().sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
}

export function obtenerSesion(id: string): SesionCNV | undefined {
  return leerTodo().find((s) => s.id === id);
}

// Guarda una sesión nueva o actualiza la que tenga el mismo id (evita duplicados)
export function guardarSesion(sesion: SesionCNV) {
  const todas = leerTodo();
  const i = todas.findIndex((s) => s.id === sesion.id);
  if (i >= 0) {
    todas[i] = sesion;
  } else {
    todas.unshift(sesion);
  }
  escribirTodo(todas);
}

export function borrarSesion(id: string) {
  escribirTodo(leerTodo().filter((s) => s.id !== id));
}

export function borrarTodoElHistorial() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // se ignora
  }
}
