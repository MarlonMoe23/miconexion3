'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trash2, Share2, ChevronRight } from "lucide-react";
import type { SesionCNV } from "@/lib/history";
import { obtenerHistorial, borrarSesion, borrarTodoElHistorial } from "@/lib/history";

function formatearFecha(iso: string) {
  const d = new Date(iso);
  const fecha = d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hora = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${fecha} · ${hora}`;
}

function resumirTexto(texto: string, max = 90) {
  return texto.length > max ? texto.slice(0, max).trim() + "…" : texto;
}

export default function HistorialPage() {
  const [sesiones, setSesiones] = useState<SesionCNV[]>([]);
  const [cargado, setCargado] = useState(false);
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  // Guarda qué se está por borrar: el id de una sesión, "todo", o nada
  const [confirmarBorrar, setConfirmarBorrar] = useState<string | null>(null);

  useEffect(() => {
    setSesiones(obtenerHistorial());
    setCargado(true);
  }, []);

  const recargar = () => setSesiones(obtenerHistorial());

  const abrirSesion = (id: string) => {
    setSeleccionadaId(id);
    setConfirmarBorrar(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const volverALista = () => {
    setSeleccionadaId(null);
    setConfirmarBorrar(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarSesion = (id: string) => {
    borrarSesion(id);
    recargar();
    volverALista();
  };

  const eliminarTodo = () => {
    borrarTodoElHistorial();
    recargar();
    setConfirmarBorrar(null);
  };

  const compartirWhatsApp = (s: SesionCNV) => {
    const texto = s.mensaje
      ? `*Mi mensaje CNV:*\n\n${s.mensaje}\n\n---\n*Detalles:*\n*Observación:* ${s.observation}\n*Sentimientos:* ${s.feelings.join(", ")}\n*Necesidades:* ${s.needs.join(", ")}`
      : `*Mi Conexión Interna - Resumen*\n\n*OBSERVACIÓN:*\n${s.observation}\n\n*SENTIMIENTOS:*\n${s.feelings.join(", ")}\n\n*NECESIDADES:*\n${s.needs.join(", ")}${
          s.requests.length ? `\n\n*PETICIONES/ESTRATEGIAS:*\n${s.requests.join("\n")}` : ""
        }`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  };

  const seleccionada = sesiones.find((s) => s.id === seleccionadaId) ?? null;

  // ─── Vista de detalle de una sesión ─────────────────────────────────────────
  if (seleccionada) {
    const s = seleccionada;
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-2 transition-colors">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={volverALista}
            className="mb-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al historial
          </Button>

          <Card className="p-4 dark:bg-slate-800 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 capitalize">
              {formatearFecha(s.fecha)}
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Observación</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-snug bg-gray-50 dark:bg-slate-700/50 p-3 rounded">
                  {s.observation}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Sentimientos</h3>
                <div className="flex flex-wrap gap-1.5">
                  {s.feelings.map((f) => (
                    <span
                      key={f}
                      className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Necesidades</h3>
                <div className="flex flex-wrap gap-1.5">
                  {s.needs.map((n) => (
                    <span
                      key={n}
                      className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {s.requests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Peticiones/Estrategias
                  </h3>
                  <ul className="space-y-1.5">
                    {s.requests.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-slate-700/50 p-2 rounded"
                      >
                        <span className="text-blue-500 dark:text-blue-400 font-bold">•</span>
                        <span className="flex-1">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {s.mensaje && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    ✨ Mi mensaje CNV
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
                    "{s.mensaje}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={() => compartirWhatsApp(s)}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Compartir por WhatsApp
              </Button>

              {confirmarBorrar === s.id ? (
                <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3">
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2 text-center">
                    ¿Borrar esta sesión? No se puede deshacer.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setConfirmarBorrar(null)}
                      className="flex-1 bg-transparent dark:text-gray-200 dark:border-slate-600"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => eliminarSesion(s.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Sí, borrar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setConfirmarBorrar(s.id)}
                  className="w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Borrar esta sesión
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Vista de lista ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-2 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Inicio
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Nueva sesión</Button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">Mi historial</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {cargado && sesiones.length > 0
            ? `${sesiones.length} ${sesiones.length === 1 ? "sesión guardada" : "sesiones guardadas"} en este dispositivo`
            : "Tus procesos CNV guardados en este dispositivo"}
        </p>

        {cargado && sesiones.length === 0 && (
          <Card className="p-6 text-center dark:bg-slate-800 dark:border-slate-700">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Aún no tienes sesiones guardadas. Cuando llegues al Resumen de un proceso, se guardará aquí
              automáticamente.
            </p>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                Empezar mi primera sesión
              </Button>
            </Link>
          </Card>
        )}

        <div className="space-y-2">
          {sesiones.map((s) => (
            <button
              key={s.id}
              onClick={() => abrirSesion(s.id)}
              className="w-full text-left"
            >
              <Card className="p-3 dark:bg-slate-800 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">
                      {formatearFecha(s.fecha)}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                      {resumirTexto(s.observation)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {s.feelings.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs"
                        >
                          {f}
                        </span>
                      ))}
                      {s.needs.slice(0, 3).map((n) => (
                        <span
                          key={n}
                          className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full text-xs"
                        >
                          {n}
                        </span>
                      ))}
                      {s.feelings.length + s.needs.length > 6 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 self-center">…</span>
                      )}
                      {s.mensaje && (
                        <span className="text-xs text-purple-600 dark:text-purple-300 self-center ml-1">✨ IA</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1 shrink-0" />
                </div>
              </Card>
            </button>
          ))}
        </div>

        {sesiones.length > 0 && (
          <div className="mt-6 mb-4">
            {confirmarBorrar === "todo" ? (
              <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3">
                <p className="text-sm text-red-700 dark:text-red-300 mb-2 text-center">
                  ¿Borrar TODO el historial? No se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmarBorrar(null)}
                    className="flex-1 bg-transparent dark:text-gray-200 dark:border-slate-600"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={eliminarTodo} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    Sí, borrar todo
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setConfirmarBorrar("todo")}
                className="w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Borrar todo el historial
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
