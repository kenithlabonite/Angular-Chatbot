const db = require('_helpers/db');
const aiProvider = require('_helpers/ai-provider');

module.exports = {
    createConversation,
    sendMessage,
    getConversation,
    getAllConversations,
    deleteConversation
};

/**
 * Create a new conversation for a user
 */
async function createConversation(AccountId, title = 'New Conversation') {
    try {
        const conversation = await db.ChatConversation.create({
            AccountId,
            title
        });

        return {
            conversationId: conversation.conversationId,
            title: conversation.title,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt
        };
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw new Error('Failed to create conversation');
    }
}

/**
 * Send a message in a conversation and get AI response
 */
async function sendMessage(conversationId, AccountId, messageContent) {
    try {
        // Verify conversation belongs to user
        const conversation = await db.ChatConversation.findOne({
            where: { conversationId, AccountId }
        });

        if (!conversation) {
            throw new Error('Conversation not found or access denied');
        }

        // Save user message
        const userMessage = await db.ChatMessage.create({
            conversationId,
            role: 'user',
            content: messageContent
        });

        // Get conversation history for context
        const history = await db.ChatMessage.findAll({
            where: { conversationId },
            order: [['createdAt', 'ASC']],
            limit: 20 // Limit context to last 20 messages
        });

        // Prepare messages for AI
        const messages = history.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Generate AI response
        const aiResponse = await aiProvider.generateResponse(messages);

        // Save AI response
        const assistantMessage = await db.ChatMessage.create({
            conversationId,
            role: 'assistant',
            content: aiResponse
        });

        // Update conversation title if it's the first message
        if (messages.length === 1) {
            const newTitle = generateConversationTitle(messageContent);
            await conversation.update({ title: newTitle });
        }

        // Update conversation timestamp
        await conversation.update({ updatedAt: new Date() });

        return {
            userMessage: {
                messageId: userMessage.messageId,
                role: userMessage.role,
                content: userMessage.content,
                createdAt: userMessage.createdAt
            },
            assistantMessage: {
                messageId: assistantMessage.messageId,
                role: assistantMessage.role,
                content: assistantMessage.content,
                createdAt: assistantMessage.createdAt
            }
        };
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

/**
 * Get a conversation with all its messages
 */
async function getConversation(conversationId, AccountId) {
    try {
        // Verify conversation belongs to user
        const conversation = await db.ChatConversation.findOne({
            where: { conversationId, AccountId },
            include: [{
                model: db.ChatMessage,
                attributes: ['messageId', 'role', 'content', 'createdAt'],
                order: [['createdAt', 'ASC']]
            }]
        });

        if (!conversation) {
            throw new Error('Conversation not found or access denied');
        }

        return {
            conversationId: conversation.conversationId,
            title: conversation.title,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            messages: conversation.ChatMessages || []
        };
    } catch (error) {
        console.error('Error getting conversation:', error);
        throw error;
    }
}

/**
 * Get all conversations for a user
 */
async function getAllConversations(AccountId) {
    try {
        const conversations = await db.ChatConversation.findAll({
            where: { AccountId },
            attributes: ['conversationId', 'title', 'createdAt', 'updatedAt'],
            order: [['updatedAt', 'DESC']],
            include: [{
                model: db.ChatMessage,
                attributes: ['messageId'],
                required: false
            }]
        });

        return conversations.map(conv => ({
            conversationId: conv.conversationId,
            title: conv.title,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            messageCount: conv.ChatMessages ? conv.ChatMessages.length : 0
        }));
    } catch (error) {
        console.error('Error getting conversations:', error);
        throw new Error('Failed to retrieve conversations');
    }
}

/**
 * Delete a conversation
 */
async function deleteConversation(conversationId, AccountId) {
    try {
        // Verify conversation belongs to user
        const conversation = await db.ChatConversation.findOne({
            where: { conversationId, AccountId }
        });

        if (!conversation) {
            throw new Error('Conversation not found or access denied');
        }

        // Delete conversation (messages will be cascade deleted)
        await conversation.destroy();

        return { message: 'Conversation deleted successfully' };
    } catch (error) {
        console.error('Error deleting conversation:', error);
        throw error;
    }
}

/**
 * Generate a conversation title from the first message
 */
function generateConversationTitle(message) {
    // Take first 50 characters or up to first period/question mark
    let title = message.substring(0, 50);
    const punctuation = title.search(/[.?!]/);

    if (punctuation > 0 && punctuation < 50) {
        title = title.substring(0, punctuation);
    }

    return title + (message.length > 50 ? '...' : '');
}
