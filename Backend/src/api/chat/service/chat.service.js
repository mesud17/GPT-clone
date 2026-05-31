export async function createConversationService(question) {
  try {
    return `Conversation created with question: ${question}`;
  } catch (error) {
    throw error;
  }
}
