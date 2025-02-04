import express from 'express';
import { createClass, findClassByCode } from '../controllers/classController.js';
import { isAuthenticated } from '../middlewares/auth.js';
const router= express.Router();
router.post("/create", isAuthenticated, createClass);
router.get("/found/bycode",isAuthenticated,findClassByCode);
export default router;
