import express from 'express';

const router = express.Router();

// ফান্ড ডাটা
router.get('/fund', (req, res) => {
  // আপাতত ডেমো ফান্ড, পরে অ্যাডমিন প্যানেল থেকে আপডেট হবে
  res.json({ totalAmount: 12500 });
});

// সর্বশেষ নোটিশ
router.get('/notices/latest', (req, res) => {
  res.json({ 
    success: true, 
    notice: { 
      title: 'মাসিক মিটিং', 
      description: 'আগামী শুক্রবার বিকাল ৫টায় ক্লাবের মাসিক মিটিং অনুষ্ঠিত হবে। সবাইকে উপস্থিত থাকার অনুরোধ করা হচ্ছে।' 
    } 
  });
});

// আসন্ন ইভেন্ট
router.get('/events/upcoming', (req, res) => {
  res.json({ 
    success: true, 
    events: [
      { title: 'বনভোজন ২০২৬', date: '2026-12-15' },
      { title: 'বার্ষিক ক্রীড়া', date: '2026-11-10' }
    ]
  });
});

export default router;