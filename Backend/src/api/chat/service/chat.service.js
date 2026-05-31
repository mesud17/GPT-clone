import db from "../../../../db/db.config.js";



// get recent conversations from the database

   async function getRecentConversations(limit) {
  limit = parseInt(limit);
  if (isNaN(limit) || limit <= 0) {
    const error = new Error("Limit must be a positive integer.");
    error.status = 400;
    throw error;
  }
  const [rows] = await db.execute(
    "SELECT * FROM conversations ORDER BY created_at DESC LIMIT ?",
    [limit]
  );
  rows.reverse();

  return rows; 
}


// create a conversation in the database
export async function createConversationService(question) {
  
  // validation
  if (!question?.trim()) {
    const error = new Error(
      "Question is required to create a conversation."
    );
    error.status = 400;
    throw error;
  }

// insert the question into the database
const [result] = await db.execute(
  "INSERT INTO conversations (content,role) VALUES (?, 'user')",
  [question]
);

  const historyRows=await getRecentConversations(5);
  return historyRows;
}



