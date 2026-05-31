import { createConversationService,getRecentConversations } from "../service/chat.service.js";

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
try {

  const result=await getRecentConversations(100);
  res.status(200).json({
    success: true,
    message: "Conversations retrieved successfully",
    data: result
  })

} catch (error) {
  throw error;
}
}
