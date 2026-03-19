import express from 'express';
import {
  createMeeting,
  getUserMeetings,
  getMeetingById,
  updateMeetingStatus,
  updateMeeting,
  deleteMeeting
} from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getUserMeetings)
  .post(createMeeting);

router.route('/:id')
  .get(getMeetingById)
  .put(updateMeeting)
  .delete(deleteMeeting);

router.put('/:id/status', updateMeetingStatus);

export default router;