import express from 'express';
import { User } from '../models/User';

const router = express.Router();

// অ্যাপ্রুভড মেম্বার লিস্ট
router.get('/approved', async (req, res) => {
  try {
    // পাসওয়ার্ড বাদে বাকি সব ডাটা আনবে
    const users = await User.find({ approved: true }).select('-password');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// গ্রুপ লিংক (আপাতত ডেমো লিংক দিলাম, পরে ডাটাবেস থেকে আসবে)
router.get('/group-link', async (req, res) => {
  res.json({ success: true, groupLink: 'https://m.me/j/AbY123456789' });
});

export default router;