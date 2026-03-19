import mongoose from 'mongoose';

const collaborationRequestSchema = new mongoose.Schema({
  entrepreneur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requestedAmount: {
    type: String,
    required: true
  },
  equity: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'under_review'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  },
  documents: [{
    name: String,
    url: String
  }]
}, {
  timestamps: true
});

collaborationRequestSchema.index({ entrepreneur: 1, createdAt: -1 });
collaborationRequestSchema.index({ investor: 1, createdAt: -1 });
collaborationRequestSchema.index({ status: 1 });

const CollaborationRequest = mongoose.model('CollaborationRequest', collaborationRequestSchema);

export default CollaborationRequest;