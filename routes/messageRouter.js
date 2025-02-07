import express from 'express';
import { createMessage, deleteMessage, editMessage, getMessageById, getMessagesForClass, getMessagesForUser, getUnreadMessagesForUser, replyToMessage } from '../controllers/messageController.js';
import { isAuthenticated } from '../middlewares/auth.js';
const router= express.Router();
router.post('/create',isAuthenticated,createMessage);
router.get('/fetch/allclassmessages/:classId',isAuthenticated,getMessagesForClass)
router.get('/fetch/allusermessages',isAuthenticated,getMessagesForUser)
router.get('/fetch/single-message/:messageId',isAuthenticated,getMessageById)
router.delete('/delete/single-message/:messageId',isAuthenticated,deleteMessage)
router.get('/fetch/unread-messages',isAuthenticated,getUnreadMessagesForUser)
router.post('/reply',isAuthenticated,replyToMessage);
router.put('/edit/sent-message/:messageId',isAuthenticated,editMessage)
export default router;
