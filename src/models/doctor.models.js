import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    doctorName: {
        type: String,
        trim: true
    },
    hospitalName: {
        type: String,
        trim: true
    },
    doctorPhone: {
        type: Number,
        trim: true
    },
    hospitalPhone: {
        type: Number,
        trim: true
    },
    medicine: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine"
    }]
},
{
    timestamps: true
})

export const Doctor = mongoose.model('Doctor', doctorSchema)