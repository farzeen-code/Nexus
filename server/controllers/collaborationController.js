import CollaborationRequest from '../models/CollaborationRequest.js';
import User from '../models/User.js';
import { sendCollaborationNotification } from '../services/emailService.js';


export const createCollaborationRequest = async (req, res) => {
  try {
    const { investor, title, description, requestedAmount, equity, message } = req.body;

    if (!investor || !title || !description || !requestedAmount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide investor, title, description, and requested amount'
      });
    }

    const investorUser = await User.findById(investor);
    if (!investorUser || investorUser.role !== 'investor') {
      return res.status(404).json({
        success: false,
        message: 'Investor not found'
      });
    }

    if (req.user.role !== 'entrepreneur') {
      return res.status(403).json({
        success: false,
        message: 'Only entrepreneurs can send collaboration requests'
      });
    }

    const collaboration = await CollaborationRequest.create({
      entrepreneur: req.user.id,
      investor,
      title,
      description,
      requestedAmount,
      equity,
      message
    });
    

    
    if (investorUser.email) {
      await sendCollaborationNotification(investorUser.email, {
        title: collaboration.title,
        requestedAmount: collaboration.requestedAmount
      });
    }
    const populatedCollaboration = await CollaborationRequest.findById(collaboration._id)
      .populate('entrepreneur', 'name email avatarUrl role startupName')
      .populate('investor', 'name email avatarUrl role');

    console.log('✅ Collaboration request created:', collaboration._id);

    res.status(201).json({
      success: true,
      message: 'Collaboration request sent successfully',
      data: populatedCollaboration
    });
  } catch (error) {
    console.error('❌ Create collaboration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create collaboration request',
      error: error.message
    });
  }
};

export const getCollaborationRequests = async (req, res) => {
  try {
    const { type, status } = req.query;

    let query = {};

    if (type === 'sent') {
      query.entrepreneur = req.user.id;
    } else if (type === 'received') {
      query.investor = req.user.id;
    } else {
      query.$or = [
        { entrepreneur: req.user.id },
        { investor: req.user.id }
      ];
    }

    if (status) {
      query.status = status;
    }

    const requests = await CollaborationRequest.find(query)
      .populate('entrepreneur', 'name email avatarUrl role startupName industry')
      .populate('investor', 'name email avatarUrl role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('❌ Get collaboration requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaboration requests',
      error: error.message
    });
  }
};

export const getCollaborationById = async (req, res) => {
  try {
    const collaboration = await CollaborationRequest.findById(req.params.id)
      .populate('entrepreneur', 'name email avatarUrl role startupName industry')
      .populate('investor', 'name email avatarUrl role');

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration request not found'
      });
    }

    if (collaboration.entrepreneur._id.toString() !== req.user.id &&
      collaboration.investor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this collaboration request'
      });
    }

    res.status(200).json({
      success: true,
      data: collaboration
    });
  } catch (error) {
    console.error('❌ Get collaboration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaboration request',
      error: error.message
    });
  }
};

export const updateCollaborationStatus = async (req, res) => {
  try {
    const { status, message } = req.body;

    if (!['accepted', 'rejected', 'under_review'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const collaboration = await CollaborationRequest.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration request not found'
      });
    }

    if (collaboration.investor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the investor can update the status'
      });
    }

    collaboration.status = status;
    if (message) collaboration.message = message;

    await collaboration.save();

    const updatedCollaboration = await CollaborationRequest.findById(collaboration._id)
      .populate('entrepreneur', 'name email avatarUrl role startupName')
      .populate('investor', 'name email avatarUrl role');

    console.log(`✅ Collaboration ${status}:`, collaboration._id);

    res.status(200).json({
      success: true,
      message: `Collaboration request ${status}`,
      data: updatedCollaboration
    });
  } catch (error) {
    console.error('❌ Update collaboration status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update collaboration status',
      error: error.message
    });
  }
};

export const deleteCollaborationRequest = async (req, res) => {
  try {
    const collaboration = await CollaborationRequest.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration request not found'
      });
    }

    if (collaboration.entrepreneur.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the entrepreneur can delete the request'
      });
    }

    await collaboration.deleteOne();

    console.log('✅ Collaboration deleted:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Collaboration request deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete collaboration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete collaboration request',
      error: error.message
    });
  }
};