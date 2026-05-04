import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { observation, feelings, needs, requests } = await req.json();

    if (!observation || !feelings?.length || !needs?.length) {
      return NextResponse.json(
        { error: "Faltan datos para generar el mensaje" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Redacta UN párrafo de Comunicación No Violenta con estos datos:

Observación: ${observation}
Sentimientos: ${feelings.join(", ")}
Necesidades: ${needs.join(", ")}
${requests?.length ? `Petición: ${requests[0]}` : ""}

Usa exactamente este formato:
"Cuando [observación resumida], me siento [sentimientos] porque necesito [necesidades]. [Petición si existe, si no omite esta parte]"

Máximo 3 oraciones. Solo el mensaje, sin explicaciones ni comillas extra.`,
        },
      ],
    });

    const texto =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ mensaje: texto });
  } catch (error) {
    console.error("Error generando mensaje CNV:", error);
    return NextResponse.json(
      { error: "No se pudo generar el mensaje" },
      { status: 500 }
    );
  }
}
