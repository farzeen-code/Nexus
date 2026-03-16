import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Debug log
    console.log('📝 Registration attempt:', { name, email, role });

    // Validate input
    if (!name || !email || !password || !role) {
      console.log('❌ Missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Validate role
    if (!['investor', 'entrepreneur'].includes(role)) {
      console.log('❌ Invalid role:', role);
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either investor or entrepreneur'
      });
    }

    // Create user
    console.log('✅ Creating user...');
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    console.log('✅ User created:', user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    // Detailed error logging
    console.error('❌ Registration error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Debug log
    console.log('🔐 Login attempt:', { email, role });

    // Validate input
    if (!email || !password || !role) {
      console.log('❌ Missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email, role }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email, role);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or user not found'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ Login successful:', user._id);

    res.status(200).json({
      success: true,
      message: 'Successfully logged in!',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error message:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Common fields that can be updated
    const commonUpdates = ['name', 'bio', 'location', 'avatarUrl'];
    
    // Role-specific fields
    const entrepreneurUpdates = ['startupName', 'pitchSummary', 'fundingNeeded', 'industry', 'foundedYear', 'teamSize'];
    const investorUpdates = ['investmentInterests', 'investmentStage', 'portfolioCompanies', 'totalInvestments', 'minimumInvestment', 'maximumInvestment'];

    // Determine allowed updates based on role
    let allowedUpdates = [...commonUpdates];
    if (user.role === 'entrepreneur') {
      allowedUpdates = [...allowedUpdates, ...entrepreneurUpdates];
    } else if (user.role === 'investor') {
      allowedUpdates = [...allowedUpdates, ...investorUpdates];
    }

    // Apply updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        user[key] = req.body[key];
      }
    });

    await user.save();

    console.log('✅ Profile updated:', user._id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      isOnline: false,
      lastSeen: new Date()
    });

    console.log('✅ User logged out:', req.user.id);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // TODO: Implement actual password reset with email
    console.log('✅ Password reset requested for:', email);
    
    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: error.message
    });
  }
};