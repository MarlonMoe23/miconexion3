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
          content: `Eres un experto en Comunicación No Violenta. 
Redacta UN párrafo empático y humano con estos datos:

Observación: ${observation}
Sentimientos: ${feelings.join(", ")}
Necesidades: ${needs.join(", ")}
${requests?.length ? `Petición: ${requests[0]}` : ""}

El mensaje debe sonar natural.
Usa el espíritu del formato CNV: observación → sentimientos → necesidades → petición.
Máximo 3 oraciones, no inventes sentimientos, ni necesidades, usa los que puso el usuario. Solo el mensaje, sin explicaciones ni comillas.`,
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
