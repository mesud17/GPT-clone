import {
  createConversationService,
  getRecentConversations,
} from "../service/chat.service.js";

export async function createChatController(req, res) {
  try {
    const { question, sessionId } = req.body;

    const result = await createConversationService(question, sessionId);

    res.status(200).json({
      success: true,
      question: result,
    });
  } catch (error) {
    console.error(error);

    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

export async function getChatController(req, res) {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required.",
      });
    }

    const result = await getRecentConversations(sessionId, 100);

    res.status(200).json({
      success: true,
      message: "Conversations retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}