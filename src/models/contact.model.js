import mongoose from "mongoose"; 

const contactSchema = new mongoose.Schema({
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
    }
}, { timestamps: true, strict: false })

const contactModel = mongoose.models.contact || mongoose.model('contact', contactSchema, 'contact');
export default contactModel;