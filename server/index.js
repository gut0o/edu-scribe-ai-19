import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// endpoint do chat (aluno vai usar)
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um tutor escolar atencioso e didático." },
        { role: "user", content: message },
      ],
    });

    const answer = completion.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao conversar com a IA." });
  }
});

app.listen(process.env.PORT || 5174, () => {
  console.log(`✅ Server rodando em http://localhost:${process.env.PORT || 5174}`);
});
