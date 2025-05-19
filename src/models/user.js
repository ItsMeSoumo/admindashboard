import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  money: {
    type: Number,
    default: 0,
    required: true,
  },
  presentmoney: {
    type: Number,
    default: 0,
    required: true,
  },
  profit: {
    type: Number,
    default: 0,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  transactions: [{
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'profit', 'loss'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  role: {
    type: String,
    enum: ['user', 'trader'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Delete old model if it exists to prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
