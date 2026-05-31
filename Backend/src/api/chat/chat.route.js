import express from 'express';
import { createChatController, getChatController } from './controller/chat.controller.js';
const chatRouter = express.Router();

chatRouter.get('/conversations', getChatController);

chatRouter.post('/conversations', createChatController);

export default chatRouter;