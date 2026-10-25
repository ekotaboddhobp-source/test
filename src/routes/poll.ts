import express from 'express';
import { Poll } from '../models/Poll';

const router = express.Router();

// সব চলমান পোল দেখা
router.get('/active', async (req, res) => {
  try {
    const polls = await Poll.find({ active: true }).sort({ createdAt: -1 });
    res.json({ success: true, polls });
  } catch (error) {
    res.status(500).json({ success: false, message: 'সার্ভার এরর' });
  }
});

// ভোট দেওয়া
router.post('/vote/:id', async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) return res.status(404).json({ success: false, message: 'পোল পাওয়া যায়নি' });
    
    if (poll.options[optionIndex]) {
      poll.options[optionIndex].votes += 1;
      await poll.save();
      res.json({ success: true, message: 'ভোট গৃহীত হয়েছে' });
    } else {
      res.status(400).json({ success: false, message: 'ভুল অপশন' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'সার্ভার এরর' });
  }
});

// (অ্যাডমিনের জন্য) নতুন পোল তৈরি করা
router.post('/create', async (req, res) => {
  try {
    const { question, options } = req.body;
    const formattedOptions = options.map((opt: string) => ({ text: opt, votes: 0 }));
    
    const newPoll = new Poll({ question, options: formattedOptions });
    await newPoll.save();
    res.json({ success: true, message: 'পোল তৈরি হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'সার্ভার এরর' });
  }
});

export default router;