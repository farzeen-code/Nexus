import User from '../models/User.js';

// @desc    Get all entrepreneurs
// @route   GET /api/users/entrepreneurs
// @access  Private
export const getAllEntrepreneurs = async (req, res) => {
  try {
    const entrepreneurs = await User.find({ role: 'entrepreneur' })
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: entrepreneurs.length,
      data: entrepreneurs.map(user => user.getPublicProfile())
    });
  } catch (error) {
    console.error('❌ Get entrepreneurs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entrepreneurs',
      error: error.message
    });
  }
};

// @desc    Get all investors
// @route   GET /api/users/investors
// @access  Private
export const getAllInvestors = async (req, res) => {
  try {
    const investors = await User.find({ role: 'investor' })
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: investors.length,
      data: investors.map(user => user.getPublicProfile())
    });
  } catch (error) {
    console.error('❌ Get investors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investors',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('❌ Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=query&role=investor
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const { q, role } = req.query;

    let query = {};

    // Filter by role if provided
    if (role && ['investor', 'entrepreneur'].includes(role)) {
      query.role = role;
    }

    // Search by name, email, or company
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { startupName: { $regex: q, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(20)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(user => user.getPublicProfile())
    });
  } catch (error) {
    console.error('❌ Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};