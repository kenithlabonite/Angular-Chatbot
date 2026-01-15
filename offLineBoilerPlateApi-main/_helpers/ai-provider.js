const config = require('config.json');

/**
 * AI Provider abstraction layer
 * Supports multiple AI providers: OpenAI GPT and Google Gemini
 */

class AIProvider {
    constructor() {
        this.provider = config.ai?.provider || 'gemini';
        this.openaiApiKey = config.ai?.openaiApiKey;
        this.geminiApiKey = config.ai?.geminiApiKey;
        this.model = config.ai?.model || 'gemini-1.5-flash';
        this.maxTokens = config.ai?.maxTokens || 1000;
        this.temperature = config.ai?.temperature || 0.7;

        // Lazy load SDKs to avoid errors if not configured
        this.openai = null;
        this.gemini = null;
    }

    /**
     * Generate AI response based on conversation history
     * @param {Array} messages - Array of message objects with {role, content}
     * @returns {Promise<string>} - AI generated response
     */
    async generateResponse(messages) {
        try {
            if (this.provider === 'openai') {
                return await this.generateOpenAIResponse(messages);
            } else if (this.provider === 'gemini') {
                return await this.generateGeminiResponse(messages);
            } else {
                throw new Error(`Unsupported AI provider: ${this.provider}`);
            }
        } catch (error) {
            console.error('AI Provider Error:', error);

            // Return a friendly error message
            if (error.message.includes('API key')) {
                return "I apologize, but I'm not properly configured. Please ask the administrator to set up the AI API key in the configuration.";
            }

            return "I'm sorry, I encountered an error while processing your request. Please try again later.";
        }
    }

    /**
     * Generate response using OpenAI GPT
     */
    async generateOpenAIResponse(messages) {
        if (!this.openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        // Lazy load OpenAI SDK
        if (!this.openai) {
            const { OpenAI } = require('openai');
            this.openai = new OpenAI({ apiKey: this.openaiApiKey });
        }

        // Convert messages to OpenAI format
        const formattedMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const completion = await this.openai.chat.completions.create({
            model: this.model || 'gpt-3.5-turbo',
            messages: formattedMessages,
            max_tokens: this.maxTokens,
            temperature: this.temperature
        });

        return completion.choices[0].message.content;
    }

    /**
     * Generate response using Google Gemini
     */
    async generateGeminiResponse(messages) {
        if (!this.geminiApiKey) {
            throw new Error('Gemini API key not configured');
        }

        // Lazy load Gemini SDK
        if (!this.gemini) {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(this.geminiApiKey);
            this.gemini = genAI.getGenerativeModel({ model: this.model || 'gemini-1.5-flash' });
        }

        // Convert conversation history to Gemini format
        // Gemini uses a different format: alternating user/model messages
        const chat = this.gemini.startChat({
            history: messages.slice(0, -1).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
            generationConfig: {
                maxOutputTokens: this.maxTokens,
                temperature: this.temperature
            }
        });

        // Send the latest message
        const latestMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(latestMessage.content);
        const response = await result.response;

        return response.text();
    }

    /**
     * Check if AI is properly configured
     */
    isConfigured() {
        if (this.provider === 'openai') {
            return !!this.openaiApiKey;
        } else if (this.provider === 'gemini') {
            return !!this.geminiApiKey;
        }
        return false;
    }
}

// Export singleton instance
module.exports = new AIProvider();
