import Meeting from '../models/Meeting.js';
import User from '../models/User.js';
import { sendMeetingNotification } from '../services/emailService.js';

// @desc    Create meeting request
// @route   POST /api/meetings
// @access  Private
export const createMeeting = async (req, res) => {
  try {
    const { requestedTo, title, description, scheduledDate, duration, meetingType, location } = req.body;

    // Validate required fields
    if (!requestedTo || !title || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide requestedTo, title, and scheduledDate'
      });
    }

    // Check if requested user exists
    const recipient = await User.findById(requestedTo);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Convert scheduledDate to Date object
    const scheduledDateObj = new Date(scheduledDate);
    const endTime = new Date(scheduledDateObj.getTime() + (duration * 60000));

    const existingMeetings = await Meeting.find({
      $or: [
        { requestedBy: req.user.id },
        { requestedTo: requestedTo }
      ],
      status: { $in: ['pending', 'accepted'] },
      scheduledDate: {
        $gte: new Date(scheduledDateObj.getTime() - (60 * 60000)),
        $lte: new Date(scheduledDateObj.getTime() + (60 * 60000))
      }
    });

    if (existingMeetings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Time slot conflict detected. Please choose a different time.',
        conflicts: existingMeetings
      });
    }

    // Create meeting
    const meeting = await Meeting.create({
      requestedBy: req.user.id,
      requestedTo,
      title,
      description,
      scheduledDate: scheduledDateObj,
      duration: duration || 30,
      meetingType: meetingType || 'video',
      location
    });

    if (recipient.email) {
      await sendMeetingNotification(recipient.email, {
        title: meeting.title,
        scheduledDate: meeting.scheduledDate,
        duration: meeting.duration
      });
    }

    // Populate user details
    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('requestedBy', 'name email avatarUrl role')
      .populate('requestedTo', 'name email avatarUrl role');

    console.log('✅ Meeting created:', meeting._id);

    res.status(201).json({
      success: true,
      message: 'Meeting request sent successfully',
      data: populatedMeeting
    });

  } catch (error) {
    console.error('❌ Create meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create meeting',
      error: error.message
    });
  }
};

// @desc    Get all meetings for current user
// @route   GET /api/meetings
// @access  Private
export const getUserMeetings = async (req, res) => {
  try {
    const { status, type } = req.query;

    let query = {
      $or: [
        { requestedBy: req.user.id },
        { requestedTo: req.user.id }
      ]
    };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by type if provided
    if (type === 'requested') {
      query = { requestedBy: req.user.id };
    } else if (type === 'received') {
      query = { requestedTo: req.user.id };
    }

    const meetings = await Meeting.find(query)
      .populate('requestedBy', 'name email avatarUrl role')
      .populate('requestedTo', 'name email avatarUrl role')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings
    });
  } catch (error) {
    console.error('❌ Get meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings',
      error: error.message
    });
  }
};

// @desc    Get single meeting
// @route   GET /api/meetings/:id
// @access  Private
export const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('requestedBy', 'name email avatarUrl role')
      .populate('requestedTo', 'name email avatarUrl role');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if user is part of this meeting
    if (meeting.requestedBy._id.toString() !== req.user.id &&
      meeting.requestedTo._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this meeting'
      });
    }

    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('❌ Get meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meeting',
      error: error.message
    });
  }
};

// @desc    Update meeting status (accept/reject)
// @route   PUT /api/meetings/:id/status
// @access  Private
export const updateMeetingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['accepted', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be accepted, rejected, or cancelled'
      });
    }

    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Only recipient can accept/reject, only requester can cancel
    if (status === 'cancelled' && meeting.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the meeting requester can cancel'
      });
    }

    if ((status === 'accepted' || status === 'rejected') &&
      meeting.requestedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the meeting recipient can accept or reject'
      });
    }

    meeting.status = status;
    if (notes) meeting.notes = notes;

    // Generate video meeting link if accepted
    if (status === 'accepted' && meeting.meetingType === 'video' && !meeting.meetingLink) {
      // For now, we'll generate a simple link
      // In production, integrate with a video service like Zoom, Google Meet, or Agora
      meeting.meetingLink = `https://nexus-meet.com/room/${meeting._id}`;
    }

    await meeting.save();

    const updatedMeeting = await Meeting.findById(meeting._id)
      .populate('requestedBy', 'name email avatarUrl role')
      .populate('requestedTo', 'name email avatarUrl role');

    console.log(`✅ Meeting ${status}:`, meeting._id);

    res.status(200).json({
      success: true,
      message: `Meeting ${status} successfully`,
      data: updatedMeeting
    });
  } catch (error) {
    console.error('❌ Update meeting status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meeting status',
      error: error.message
    });
  }
};

// @desc    Update meeting details
// @route   PUT /api/meetings/:id
// @access  Private
export const updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Only requester can update
    if (meeting.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this meeting'
      });
    }

    const allowedUpdates = ['title', 'description', 'scheduledDate', 'duration', 'meetingType', 'location'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        meeting[field] = req.body[field];
      }
    });

    await meeting.save();

    const updatedMeeting = await Meeting.findById(meeting._id)
      .populate('requestedBy', 'name email avatarUrl role')
      .populate('requestedTo', 'name email avatarUrl role');

    console.log('✅ Meeting updated:', meeting._id);

    res.status(200).json({
      success: true,
      message: 'Meeting updated successfully',
      data: updatedMeeting
    });
  } catch (error) {
    console.error('❌ Update meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meeting',
      error: error.message
    });
  }
};

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private
export const deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Only requester can delete
    if (meeting.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this meeting'
      });
    }

    await meeting.deleteOne();

    console.log('✅ Meeting deleted:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete meeting',
      error: error.message
    });
  }
};