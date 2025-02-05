import express from 'express';
import { demoteAdmin, getPendingRequests, getUserClasses, leaveClass, listClassMembers, managePendingRequest, promoteToAdmin, removeMember, requestToJoinClass } from '../controllers/classMembershipController.js';
import { isAuthenticated } from '../middlewares/auth.js';
const router= express.Router();
router.post("/join/request", isAuthenticated,requestToJoinClass );
router.get("/get/pending-requests/:classId", isAuthenticated,getPendingRequests );
router.post("/pending-request/status",isAuthenticated,managePendingRequest);
router.get("/list/members/:classId",isAuthenticated,listClassMembers);
router.post("/promote/admin/:classId",isAuthenticated,promoteToAdmin);
router.delete("/remove/member",isAuthenticated,removeMember);
router.delete("/leave/as-member/:classId",isAuthenticated,leaveClass);
router.post("/demote-admin/:classId", isAuthenticated, demoteAdmin);
router.get("/get/myclasses",isAuthenticated,getUserClasses)
export default router;
