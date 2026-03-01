// ollamaService.ts

import axios from 'axios';

const OLLAMA_API_URL = 'https://api.ollama.com/v1/chat';
let conversationHistory = [];

export const sendMessageToOllama = async (message) => {
    try {
        const response = await axios.post(OLLAMA_API_URL, {
            message,
            history: conversationHistory
        });
        conversationHistory.push({ user: message, bot: response.data.reply });
        return response.data.reply;
    } catch (error) {
        console.error('Error sending message to Ollama:', error);
        throw error;
    }
};

export const getConversationHistory = () => {
    return conversationHistory;
};

export const clearConversationHistory = () => {
    conversationHistory = [];
};

export const streamOllamaResponse = async (message, callback) => {
    const responseStream = await axios.post(OLLAMA_API_URL, { message, history: conversationHistory }, { responseType: 'stream' });
    responseStream.data.on('data', (chunk) => {
        callback(chunk.toString());
    });
};