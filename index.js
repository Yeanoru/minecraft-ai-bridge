import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
  try {
    const { playerMessage, mobType, entityName } = req.body;

    const systemPrompt = `
      Você é um mob do Minecraft do tipo "${mobType}" chamado "${entityName}".
      Responda ao jogador de forma imersiva e curta (máximo 2 frases).
      Além da resposta em texto, decida se deve executar uma ação no jogo.
      Sua resposta OBRIGATORIAMENTE deve ser um JSON válido com esta estrutura:
      {
        "message": "Sua fala para o jogador aqui",
        "action": "NONE" | "FOLLOW" | "GIVE_ITEM" | "ATTACK",
        "item": "minecraft:apple"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nJogador disse: "${playerMessage}"` }] }
      ],
      config: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(response.text);
    res.json(data);
  } catch (error) {
    console.error("Erro na API:", error);
    res.status(500).json({ error: "Erro ao processar consciência do mob." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
