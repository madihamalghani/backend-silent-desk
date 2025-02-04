import express from 'express';
import { deleteAccount, getusers, login, logout, register } from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/auth.js';
const router= express.Router();
router.post('/register',register);
router.post('/login',login);
router.get('/logout',isAuthenticated,logout);
router.get('/all/users',isAuthenticated,getusers)
router.delete('/delete/account',isAuthenticated,deleteAccount)
export default router;
