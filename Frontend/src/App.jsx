/**
 * @file App.jsx
 * @description Root component. Manages conversation state and handles
 *              fetching and posting messages to the backend API.
 */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import Sidebar from './components/Sidebar/Sidebar';
import ChatHeader from './components/ChatHeader/ChatHeader';
import MessageList from './components/MessageList/MessageList';
import ChatInput from './components/ChatInput/ChatInput';
import './App.css';

/** Base URL for all backend API requests */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Create or retrieve a unique session ID for this browser
  const sessionId = useRef(
    localStorage.getItem('session_id') || uuidv4()
  );

  useEffect(() => {
    localStorage.setItem('session_id', sessionId.current);
  }, []);

  /** Scrolls the chat to the latest message */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversations, isLoading]);

  /** Fetches existing conversations from the backend on mount */
  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/conversations`, {
        params: {
          sessionId: sessionId.current,
        },
      });

      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  /**
   * Sends a new message to the backend and updates the conversation list.
   * Optimistically adds the user message before the response arrives.
   * @param {string} question - The user's input message.
   */
  const handleSendMessage = async question => {
    const tempUserMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
    };

    setConversations(prev => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/conversations`, {
        question,
        sessionId: sessionId.current,
      });

      const { userConversation, assistantConversation } =
        response.data.question;

      setConversations(prev => {
        const filtered = prev.filter(msg => msg.id !== tempUserMessage.id);
        return [...filtered, userConversation, assistantConversation];
      });
    } catch (error) {
      console.error('Error posting conversation:', error);

      const errorMessage =
        error.response?.data?.message ||
        'There was an error generating a response.';

      const errorConversation = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMessage,
      };

      setConversations(prev => [...prev, errorConversation]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='app'>
      <Sidebar />

      <main className='chat'>
        <ChatHeader />

        <MessageList
          conversations={conversations}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;