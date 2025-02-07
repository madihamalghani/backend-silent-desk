import express from 'express';
import { createClass, findClassByCode, getAdminClasses, getAllClasses, getUserClasses, updateClass } from '../controllers/classController.js';
import { isAuthenticated } from '../middlewares/auth.js';
const router= express.Router();
router.post("/create", isAuthenticated, createClass);
router.get("/found/bycode",isAuthenticated,findClassByCode);
router.get('/all/classes',isAuthenticated,getAllClasses);
router.get('/member/classes',isAuthenticated,getUserClasses);
router.get('/admin/classes',isAuthenticated,getAdminClasses);
router.put('/update/details/:classId',isAuthenticated,updateClass);

export default router;
