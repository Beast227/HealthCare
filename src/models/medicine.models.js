import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const medicineSchema = new mongoose.Schema({
    medName: {
        type: String,
        default: null
    },
    medDetails: {
        type: object,
        required: true,
        properties: {
            description: {
                type: String
            },
            dosage: {
                type: Number
            },
            sideEffects: {
                type: String
            }
        }
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    alarm: 
    {
        type: Boolean,
        required: true,
        default: false
    }
},
{
    timestamps: true
})

medicineSchema.plugin(mongooseAggregatePaginate)

export const Medicine = mongoose.model("Medicine", medicineSchema)