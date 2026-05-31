import { createConversationService } from "../service/chat.service.js";
export async function createChatController(req, res) {
  try {
    const { question } = req.body;
    const result = await createConversationService(question);
    res.json({ question: result });
  } catch (error) {
    throw error;
  }
}
export async function getChatController(req, res) {
  res.send("This is a response from the get chat controller!");
}
