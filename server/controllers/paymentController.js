import Transaction from '../models/Transaction.js';

export const createTransaction = async (req, res) => {
  try {
    const { type, amount, recipient, description, paymentMethod } = req.body;

    if (!type || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Type and amount are required'
      });
    }

    const transactionId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount,
      recipient,
      description,
      paymentMethod: paymentMethod || 'stripe',
      transactionId,
      status: 'completed'
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('user', 'name email')
      .populate('recipient', 'name email');

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: populatedTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Transaction failed',
      error: error.message
    });
  }
};

export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { user: req.user.id },
        { recipient: req.user.id }
      ]
    })
      .populate('user', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

export const getBalance = async (req, res) => {
  try {
    const deposits = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const withdrawals = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'withdraw', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const balance = (deposits[0]?.total || 0) - (withdrawals[0]?.total || 0);

    res.status(200).json({
      success: true,
      data: { balance, currency: 'USD' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get balance',
      error: error.message
    });
  }
};