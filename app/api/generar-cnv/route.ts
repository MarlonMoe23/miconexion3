import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Límites de uso (ajusta estos números a tu gusto) ────────────────────────
const MAX_POR_VENTANA = 8; // mensajes con IA por persona cada 10 minutos
const VENTANA_MS = 10 * 60 * 1000;
const MAX_POR_DIA = 30; // mensajes con IA por persona cada 24 horas
const DIA_MS = 24 * 60 * 60 * 1000;
const MAX_IPS_EN_MEMORIA = 5000;

// ─── Límites de tamaño de lo que se envía ────────────────────────────────────
const MAX_BODY_BYTES = 20000;
const MAX_OBSERVACION = 1000; // caracteres
const MAX_ITEMS_SENTIMIENTOS = 30;
const MAX_ITEMS_NECESIDADES = 30;
const MAX_ITEMS_PETICIONES = 10;
const MAX_LARGO_ITEM = 60; // sentimientos y necesidades
const MAX_LARGO_PETICION = 300;

// Registro en memoria: IP -> momentos de sus solicitudes.
// En Vercel cada instancia tiene su propia memoria, por eso es una protección
// "de mejor esfuerzo". El tope real de gasto se pone en la consola de Anthropic.
const registro = new Map<string, number[]>();

type ResultadoLimite = { ok: true } | { ok: false; esperaSeg: number };

function revisarLimite(ip: string): ResultadoLimite {
  const ahora = Date.now();
  const marcas = (registro.get(ip) ?? []).filter((t) => ahora - t < DIA_MS);
  const enVentana = marcas.filter((t) => ahora - t < VENTANA_MS);

  if (enVentana.length >= MAX_POR_VENTANA) {
    registro.set(ip, marcas);
    return { ok: false, esperaSeg: Math.ceil((VENTANA_MS - (ahora - enVentana[0])) / 1000) };
  }
  if (marcas.length >= MAX_POR_DIA) {
    registro.set(ip, marcas);
    return { ok: false, esperaSeg: Math.ceil((DIA_MS - (ahora - marcas[0])) / 1000) };
  }

  marcas.push(ahora);
  registro.set(ip, marcas);

  // Limpieza para que la memoria no crezca sin límite
  if (registro.size > MAX_IPS_EN_MEMORIA) {
    registro.forEach((v, k) => {
      if (v.every((t) => ahora - t >= DIA_MS)) registro.delete(k);
    });
  }
  return { ok: true };
}

function obtenerIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "desconocida"
  );
}

// Solo acepta llamadas que vengan de la propia app (mismo dominio)
function origenValido(req: NextRequest): boolean {
  const fuente = req.headers.get("origin") ?? req.headers.get("referer");
  const host = req.headers.get("host");
  if (!fuente || !host) return false;
  try {
    return new URL(fuente).host === host;
  } catch {
    return false;
  }
}

function textoValido(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 && t.length <= max ? t : null;
}

function listaValida(
  v: unknown,
  maxItems: number,
  maxLargo: number,
  obligatoria: boolean
): string[] | null {
  if (v === undefined || v === null) return obligatoria ? null : [];
  if (!Array.isArray(v) || v.length > maxItems) return null;
  if (obligatoria && v.length === 0) return null;
  const salida: string[] = [];
  for (const item of v) {
    const t = textoValido(item, maxLargo);
    if (t === null) return null;
    salida.push(t);
  }
  return salida;
}

function error(mensaje: string, status: number, extra?: Record<string, string>) {
  return NextResponse.json({ error: mensaje }, { status, headers: extra });
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("Falta la variable ANTHROPIC_API_KEY");
      return error("El servicio de IA no está configurado", 500);
    }

    // 1. Solo desde la propia app
    if (!origenValido(req)) {
      return error("Solicitud no permitida", 403);
    }

    // 2. Límite de uso por persona
    const limite = revisarLimite(obtenerIp(req));
    if (!limite.ok) {
      const minutos = Math.max(1, Math.ceil(limite.esperaSeg / 60));
      return error(
        `Has llegado al límite de mensajes con IA. Intenta de nuevo en ${minutos} minuto${minutos === 1 ? "" : "s"}.`,
        429,
        { "Retry-After": String(limite.esperaSeg) }
      );
    }

    // 3. Tamaño máximo de la solicitud
    const largo = Number(req.headers.get("content-length") ?? 0);
    if (largo > MAX_BODY_BYTES) {
      return error("Los datos enviados son demasiado largos", 413);
    }

    // 4. Validar y limpiar los datos
    const cuerpo = await req.json().catch(() => null);
    if (!cuerpo || typeof cuerpo !== "object") {
      return error("Datos no válidos", 400);
    }

    const observation = textoValido(cuerpo.observation, MAX_OBSERVACION);
    const feelings = listaValida(cuerpo.feelings, MAX_ITEMS_SENTIMIENTOS, MAX_LARGO_ITEM, true);
    const needs = listaValida(cuerpo.needs, MAX_ITEMS_NECESIDADES, MAX_LARGO_ITEM, true);
    const requests = listaValida(cuerpo.requests, MAX_ITEMS_PETICIONES, MAX_LARGO_PETICION, false);

    if (!observation || !feelings || !needs || !requests) {
      return error(
        "Faltan datos o son demasiado largos (observación máx. 1000 caracteres, peticiones máx. 300)",
        400
      );
    }

    // 5. Llamada a Claude (el prompt es el mismo de antes)
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Eres un experto en Comunicación No Violenta. Redacta UN párrafo empático y humano en primera persona con estos datos:

Observación: ${observation}
Sentimientos: ${feelings.join(", ")}
Necesidades: ${needs.join(", ")}
${requests.length ? `Peticiones/Estrategias: ${requests.join(", ")}` : ""}

El mensaje debe sonar natural. Puedes empezar con la palabra Cuando...
Usa el espíritu del formato CNV: observación → sentimientos → necesidades → petición. IMPORTANTE: Los sentimientos deben expresarse con naturalidad y Las necesidades deben expresarse como sustantivos puros (ej: "consideración", "conexión", "autonomía"), NUNCA como "sentirme + adjetivo" o "necesitar + verbo".
Máximo 3 oraciones, no inventes sentimientos, ni necesidades, usa los que están listados. Solo el mensaje, sin explicaciones ni comillas.`,
        },
      ],
    });

    const texto =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ mensaje: texto });
  } catch (err) {
    console.error("Error generando mensaje CNV:", err);
    return error("No se pudo generar el mensaje", 500);
  }
}
