import mongoose from "mongoose"; 

const devSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    email: {
        type: String,
        required: [true, 'email is required']   
    },
    phone: {
        type: String,
        default: ''
    },
    company: {
        type: String,
        required: true
    },
    projectType: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    technologies: {
        type: [String],
        default: []
    },
    timeline: {
        type: String,
        default: ''
    },
    budget: {
        type: Number,
        default: 0
    }
}, { timestamps: true, strict: false })

const devModel = mongoose.models.dev || mongoose.model('dev', devSchema, 'dev');
export default devModel;
