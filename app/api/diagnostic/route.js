import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3', // ou le modèle que tu as téléchargé dans Ollama (ex: mistral)
        messages: [
          {
            role: 'system',
            content: "Tu es un mécanicien expert en moto tout-terrain. À la fin de chaque message, propose obligatoirement 2 ou 3 choix clairs et chiffrés sous forme de liste numérotée (1., 2., 3.)."
          },
          ...messages
        ],
        stream: false
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error("Erreur avec Ollama en local. Vérifie qu'il est bien lancé.");
    }

    return NextResponse.json({ reply: data.message.content });
  } catch (error) {
    console.error("Erreur serveur :", error.message);
    return NextResponse.json({ error: "Impossible de joindre l'IA locale. Lance Ollama sur ton PC." }, { status: 500 });
  }
}