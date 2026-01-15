const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize');
const chatbotService = require('./chatbot.service');

// All routes require authentication
router.post('/conversations', authorize(), createConversation);
router.post('/conversations/:conversationId/messages', authorize(), sendMessageSchema, sendMessage);
router.get('/conversations/:conversationId', authorize(), getConversation);
router.get('/conversations', authorize(), getAllConversations);
router.delete('/conversations/:conversationId', authorize(), deleteConversation);

module.exports = router;

/**
 * Create a new conversation
 */
function createConversation(req, res, next) {
    const AccountId = req.user.AccountId;
    const { title } = req.body;

    chatbotService.createConversation(AccountId, title)
        .then(conversation => res.json(conversation))
        .catch(next);
}

/**
 * Validation schema for sending messages
 */
function sendMessageSchema(req, res, next) {
    const schema = Joi.object({
        message: Joi.string().required().min(1).max(5000)
    });
    validateRequest(req, next, schema);
}

/**
 * Send a message and get AI response
 */
function sendMessage(req, res, next) {
    const AccountId = req.user.AccountId;
    const conversationId = parseInt(req.params.conversationId);
    const { message } = req.body;

    chatbotService.sendMessage(conversationId, AccountId, message)
        .then(response => res.json(response))
        .catch(next);
}

/**
 * Get a conversation with all messages
 */
function getConversation(req, res, next) {
    const AccountId = req.user.AccountId;
    const conversationId = parseInt(req.params.conversationId);

    chatbotService.getConversation(conversationId, AccountId)
        .then(conversation => res.json(conversation))
        .catch(next);
}

/**
 * Get all conversations for the authenticated user
 */
function getAllConversations(req, res, next) {
    const AccountId = req.user.AccountId;

    chatbotService.getAllConversations(AccountId)
        .then(conversations => res.json(conversations))
        .catch(next);
}

/**
 * Delete a conversation
 */
function deleteConversation(req, res, next) {
    const AccountId = req.user.AccountId;
    const conversationId = parseInt(req.params.conversationId);

    chatbotService.deleteConversation(conversationId, AccountId)
        .then(response => res.json(response))
        .catch(next);
}
