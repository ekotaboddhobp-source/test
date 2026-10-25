import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Email এখন Required
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fatherName: { type: String, required: false },
  area: { type: String, required: true },
  houseName: { type: String, required: false },
  role: { type: String, default: 'user' },
  approved: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }, // নতুন: ইমেইল ভেরিফাইড কিনা
  otp: { type: String },                        // নতুন: OTP কোড
  otpExpires: { type: Date },                   // নতুন: OTP কতক্ষণ ভ্যালিড
  memberId: { type: String, unique: true, sparse: true },
  bloodGroup: { type: String, default: 'N/A' },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', userSchema);