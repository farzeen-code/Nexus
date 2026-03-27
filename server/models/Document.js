import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: Number,
  fileType: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'signed', 'completed'],
    default: 'draft'
  },
  signature: {
    signedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    signatureData: String,
    signedAt: Date
  },
  relatedTo: {
    type: String,
    ref: 'CollaborationRequest'
  }
}, {
  timestamps: true
});

export default mongoose.model('Document', documentSchema);