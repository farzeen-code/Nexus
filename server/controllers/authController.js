import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '../services/emailService.js';



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

    console.log('📝 Registration attempt:', { name, email, role, hasPassword: !!password });

    if (!name || !email || !password || !role) {
      console.log('❌ Missing fields:', { name: !!name, email: !!email, password: !!password, role: !!role });
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    console.log('✅ Creating user...');
    const user = await User.create({
      name,
      email,
      password,
      role
    });
    await sendWelcomeEmail(user.email, user.name);

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const publicProfile = user.getPublicProfile();

    console.log('✅ User created:', user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: publicProfile
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
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
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email, hasPassword: !!password });

    if (!email || !password) {
      console.log('❌ Missing fields:', { email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const publicProfile = user.getPublicProfile();

    console.log('✅ Login successful:', user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: publicProfile
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
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
    console.log('📝 Profile update request:', req.body);
    
    const updates = req.body;
    const allowedUpdates = [
      'name', 'bio', 'location', 'avatarUrl',
      'startupName', 'pitchSummary', 'fundingNeeded', 'industry', 'foundedYear', 'teamSize',
      'investmentInterests', 'investmentStage', 'portfolioCompanies', 
      'totalInvestments', 'minimumInvestment', 'maximumInvestment'
    ];

    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key) && updates[key] !== undefined && updates[key] !== null) {
        filteredUpdates[key] = updates[key];
      }
    });

    console.log('✅ Filtered updates:', filteredUpdates);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const publicProfile = user.getPublicProfile();

    console.log('✅ Profile updated successfully:', user._id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: publicProfile
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
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