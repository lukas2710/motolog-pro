import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "Tu es un mécanicien expert en moto tout-terrain (2 temps et 4 temps). Ton rôle est d'analyser les symptômes techniques avec précision chirurgicale. À la fin de chaque message, propose obligatoirement 2 ou 3 choix clairs et chiffrés sous forme de liste numérotée (1., 2., 3.) pour que l'utilisateur puisse orienter immédiatement la suite du diagnostic."
          },
          ...messages
        ],
        temperature: 0.7,
      })
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error?.message || "Erreur API OpenAI");
    }

    return NextResponse.json({ reply: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}