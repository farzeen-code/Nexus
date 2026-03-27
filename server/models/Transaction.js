import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdraw', 'transfer', 'payment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: String,
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer'],
    default: 'stripe'
  },
  transactionId: String,
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['CollaborationRequest', 'Meeting']
  }
}, {
  timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);