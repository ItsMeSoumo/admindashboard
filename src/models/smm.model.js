import mongoose from "mongoose"; 

const smmSchema = new mongoose.Schema({
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
    platforms: {
        type: [String],
        default: []
    },
    budget: {
        type: Number,
        default: 0
    }
}, { timestamps: true, strict: false })

const smmModel = mongoose.models.smm || mongoose.model('smm', smmSchema, 'smm');
export default smmModel;
