import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['investor', 'entrepreneur'],
    required: [true, 'Role is required']
  },
  avatarUrl: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=random`;
    }
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  
  // Entrepreneur-specific fields
  startupName: {
    type: String,
    default: ''
  },
  pitchSummary: {
    type: String,
    default: ''
  },
  fundingNeeded: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: ''
  },
  foundedYear: {
    type: Number
  },
  teamSize: {
    type: Number
  },
  
  // Investor-specific fields
  investmentInterests: {
    type: [String],
    default: []
  },
  investmentStage: {
    type: [String],
    default: []
  },
  portfolioCompanies: {
    type: [String],
    default: []
  },
  totalInvestments: {
    type: Number,
    default: 0
  },
  minimumInvestment: {
    type: String,
    default: ''
  },
  maximumInvestment: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const profile = {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatarUrl: this.avatarUrl,
    bio: this.bio,
    location: this.location,
    isOnline: this.isOnline,
    createdAt: this.createdAt
  };

  // Add role-specific fields
  if (this.role === 'entrepreneur') {
    profile.startupName = this.startupName;
    profile.pitchSummary = this.pitchSummary;
    profile.fundingNeeded = this.fundingNeeded;
    profile.industry = this.industry;
    profile.foundedYear = this.foundedYear;
    profile.teamSize = this.teamSize;
  } else if (this.role === 'investor') {
    profile.investmentInterests = this.investmentInterests;
    profile.investmentStage = this.investmentStage;
    profile.portfolioCompanies = this.portfolioCompanies;
    profile.totalInvestments = this.totalInvestments;
    profile.minimumInvestment = this.minimumInvestment;
    profile.maximumInvestment = this.maximumInvestment;
  }

  return profile;
};

const User = mongoose.model('User', userSchema);

export default User;