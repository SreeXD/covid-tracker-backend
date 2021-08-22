import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import * as tf from '@tensorflow/tfjs-node';

import Prediction from './models/prediction.js';
import predictionRoutes from './routes/predictions.js';
import fallbackRoutes from './routes/fallback.js';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use('/fallback', fallbackRoutes);
app.use('/prediction', predictionRoutes);

mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, async () => {
    app.set('fdaily', JSON.parse(fs.readFileSync('data/fdaily.json', 'utf8')));
    app.set('ftimeseries', JSON.parse(fs.readFileSync('data/ftimeseries.json', 'utf8')));
       
    const encoder = await tf.loadGraphModel(`${process.env.MODEL_PATH}/encoder/model.json`);
    const decoder = await tf.loadGraphModel(`${process.env.MODEL_PATH}/decoder/model.json`);
    const modelParams = JSON.parse(fs.readFileSync('data/modelParams.json', 'utf8'));
    modelParams.date = Date.parse(modelParams.date);
    for (const x of ['exMean', 'exStd', 'lbMean', 'lbStd']) 
        modelParams[x] = tf.tensor(modelParams[x]);

    app.set('encoder', encoder);
    app.set('decoder', decoder);
    app.set('modelParams', modelParams);

    app.listen(process.env.PORT, () => console.log(`listening to port ${process.env.PORT}.`));
});