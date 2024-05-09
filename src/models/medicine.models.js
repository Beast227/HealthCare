import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const medicineSchema = new mongoose.Schema({
    medName: {
        type: String,
        default: null
    },
    dosage: {
        type: String
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    medicineImage: {
        type: String
    }
},
{
    timestamps: true
})

medicineSchema.plugin(mongooseAggregatePaginate)

export const Medicine = mongoose.model("Medicine", medicineSchema)