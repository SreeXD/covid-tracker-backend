import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
    date: {
        index: true,
        type: Date,
        default: new Date()
    },
    confirmed: Number,
    recovered: Number,
    deceased: Number
});

const Prediction = mongoose.model('predictions', predictionSchema);

export default Prediction;