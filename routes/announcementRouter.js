import express from 'express';
import { createAnnouncement, deleteAnnouncement, getAnnouncementById, getAnnouncementsByClass, updateAnnouncement } from '../controllers/announcementController.js';
import { isAuthenticated } from '../middlewares/auth.js';
const router= express.Router();
router.post("/create/:classId", isAuthenticated,createAnnouncement );
router.get('/get/all/:classId',isAuthenticated,getAnnouncementsByClass);
router.get('/get/byid/:announcementId',isAuthenticated,getAnnouncementById);
router.put('/update/:announcementId',isAuthenticated,updateAnnouncement);
router.delete('/delete/:announcementId',isAuthenticated,deleteAnnouncement)
export default router;
