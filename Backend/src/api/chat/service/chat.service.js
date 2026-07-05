import db from "../../../../db/db.config.js";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getRecentConversations(limit) {
  limit = Number(limit);

  if (!Number.isInteger(limit) || limit <= 0) {
    const error = new Error("Limit must be a positive integer.");
    error.status = 400;
    throw error;
  }

  // Use query() instead of execute() because LIMIT ? can fail
  const [rows] = await db.query(`
    SELECT content, role
    FROM GPT_clone
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);

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
    `SELECT
        id,
        role,
        content,
        token_count,
        created_at
     FROM GPT_clone
     WHERE id = ?
     LIMIT 1`,
    [messageId]
  );

  if (rows.length === 0) {
    return null;
  }

  return {
    id: rows[0].id,
    role: rows[0].role,
    content: rows[0].content,
    token_count: Number(rows[0].token_count || 0),
    created_at: rows[0].created_at,
  };
}

export async function createConversationService(question) {
  try {
    if (!question?.trim()) {
      const error = new Error(
        "Question is required to create a conversation."
      );
      error.status = 400;
      throw error;
    }

    const historyRows = await getRecentConversations(5);

    const [userResult] = await db.execute(
      `INSERT INTO GPT_clone (content, role)
       VALUES (?, ?)`,
      [question, "user"]
    );

    const { text, totalTokens } = await generateAssistantAnswer({
      historyRows,
      question,
    });

    const [assistantResult] = await db.execute(
      `INSERT INTO GPT_clone (role, content, token_count)
       VALUES (?, ?, ?)`,
      ["assistant", text, totalTokens]
    );

    const userConversation = await getMessageById(userResult.insertId);
    const assistantConversation = await getMessageById(
      assistantResult.insertId
    );

    return {
      userConversation,
      assistantConversation,
    };
  } catch (error) {
    console.error("Error in createConversationService:", error);
    throw error;
  }
}