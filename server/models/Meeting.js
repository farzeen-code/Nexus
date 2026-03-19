import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  meetingType: {
    type: String,
    enum: ['video', 'phone', 'in-person'],
    default: 'video'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  meetingLink: {
    type: String, // Video call link
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  location: {
    type: String, // For in-person meetings
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
meetingSchema.index({ requestedBy: 1, scheduledDate: 1 });
meetingSchema.index({ requestedTo: 1, scheduledDate: 1 });
meetingSchema.index({ status: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;