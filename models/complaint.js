import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    title: { type: String, required: true },
    email: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    imageUrl: { type: String },
    resolved: { type: String, default: 'false' }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint