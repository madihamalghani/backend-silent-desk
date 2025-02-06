import express from 'express';
import { createMessage, getMessageById, getMessagesForClass, getMessagesForUser, replyToMessage } from '../controllers/messageController.js';
import { isAuthenticated } from '../middlewares/auth.js';
const router= express.Router();
router.post('/create',isAuthenticated,createMessage);
router.get('/fetch/allclassmessages/:classId',isAuthenticated,getMessagesForClass)
router.get('/fetch/allusermessages',isAuthenticated,getMessagesForUser)
router.get('/fetch/single-message/:messageId',isAuthenticated,getMessageById)
// router.delete('/delete/single-message/:messageId',isAuthenticated,deleteMessage)
router.post('/reply',isAuthenticated,replyToMessage);
export default router;
