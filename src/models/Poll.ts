import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
  }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Poll = mongoose.model('Poll', pollSchema);