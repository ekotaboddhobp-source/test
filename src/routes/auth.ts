import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { sendOtpEmail } from '../utils/sendEmail';

const router = express.Router();

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, fatherName, area, houseName } = req.body;

    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ success: false, message: 'এই নম্বর বা ইমেইল দিয়ে ইতিমধ্যে রেজিস্ট্রেশন করা হয়েছে' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // ১০ মিনিট

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingUser) {
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.fatherName = fatherName;
      existingUser.area = area;
      existingUser.houseName = houseName;
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
    } else {
      const newUser = new User({
        name, email, phone, password: hashedPassword, fatherName, area, houseName, otp, otpExpires,
      });
      await newUser.save();
    }

    await sendOtpEmail(email, otp);

    res.status(201).json({
      success: true,
      message: 'OTP পাঠানো হয়েছে, অনুগ্রহ করে ইমেইল চেক করুন।',
      email: email,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'সার্ভার এরর' });
  }
});

// ================= VERIFY OTP =================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });

    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'ভুল OTP দিয়েছেন' });
    if (user.otpExpires && user.otpExpires < new Date()) return res.status(400).json({ success: false, message: 'OTP-এর মেয়াদ শেষ' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'ইমেইল সফলভাবে ভেরিফাই হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'সার্ভার এরর' });
  }
});

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
    if (!user.isVerified) return res.status(400).json({ success: false, message: 'আপনার ইমেইল ভেরিফাই করা হয়নি।' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'পাসওয়ার্ড ভুল' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );

    const userData = { ...user.toObject(), password: undefined };

    res.status(200).json({ success: true, token, user: userData, message: 'লগইন সফল' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'সার্ভার এরর' });
  }
});

// ================= REGISTER APPROVAL (নতুন) =================
router.post('/register-approval', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided' });
    
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    
    // ডাটাবেসে ইউজারকে অ্যাপ্রুভড করা হলো
    await User.findByIdAndUpdate(decoded.userId, { approved: true });
    
    res.json({ success: true, message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;