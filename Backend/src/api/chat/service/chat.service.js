import db from "../../../../db/db.config.js";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getRecentConversations(sessionId, limit = 5) {
  const [rows] = await db.execute(
    `
    SELECT content, role
    FROM GPT_clone
    WHERE session_id = ?
    ORDER BY created_at DESC
    LIMIT ?
    `,
    [sessionId, Number(limit)]
  );

  return rows.reverse();
}

async function generateAssistantAnswer({ historyRows, question }) {
  const formattedHistory = historyRows.map((row) => ({
    role: row.role === "assistant" ? "model" : "user",
    parts: [{ text: row.content }],
  }));

  const chat = ai.chats.create({
    model: GEMINI_MODEL,
    history: formattedHistory,
  });

  const result = await chat.sendMessage({
    message: question,
  });

  return {
    text: result.text,
    totalTokens: result.usageMetadata.totalTokenCount,
  };
}

async function getMessageById(messageId) {
  const [rows] = await db.execute(
    `
    SELECT
      id,
      session_id,
      role,
      content,
      token_count,
      created_at
    FROM GPT_clone
    WHERE id = ?
    `,
    [messageId]
  );

  return rows.length ? rows[0] : null;
}

export async function createConversationService(question, sessionId) {
  if (!question?.trim()) {
    throw new Error("Question is required.");
  }

  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  const historyRows = await getRecentConversations(sessionId);

  const [userResult] = await db.execute(
    `
    INSERT INTO GPT_clone (session_id, content, role)
    VALUES (?, ?, ?)
    `,
    [sessionId, question, "user"]
  );

  const { text, totalTokens } = await generateAssistantAnswer({
    historyRows,
    question,
  });

  const [assistantResult] = await db.execute(
    `
    INSERT INTO GPT_clone (session_id, role, content, token_count)
    VALUES (?, ?, ?, ?)
    `,
    [sessionId, "assistant", text, totalTokens]
  );

  return {
    userConversation: await getMessageById(userResult.insertId),
    assistantConversation: await getMessageById(assistantResult.insertId),
  };
}