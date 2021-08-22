import axios from 'axios';
import tf from '@tensorflow/tfjs-node';

import Prediction from '../models/prediction.js';

export const getPrediction = async (req, res) => {
    try {
        const date = req.params.date; 
        let pre = await Prediction.find({ date: date });

        if (!pre.length) {
            const features = [ 'confirmed', 'recovered', 'deceased', 'tested', 'vaccinated1', 'vaccinated2' ];
            const modelParams = req.app.get('modelParams');
            let data = null;

            try {
                const res = await axios.get(process.env.TIMESERIES_ENDPOINT);
                data = res.data.TT.dates;
            }

            catch (error) { 
                data = req.app.get('ftimeseries').TT.dates;
            }

            let dates = Object.keys(data);        
            let prev = new Date(date);
            prev.setDate(prev.getDate() - 1);
            let index = dates.indexOf(prev.toISOString().slice(0, 10));

            const x = dates
                .slice(index - 6, index + 1)
                .map(date => data[date].total)
                .map(total => {
                    let ret = [];
                    for (const x of features) 
                        ret.push(total[x]);
                    
                    return ret;
                });

            let xt = tf.tensor(x);
            xt = xt.sub(modelParams.exMean).div(modelParams.exStd);
            xt = tf.expandDims(xt, 0);
            const encoder = req.app.get('encoder');
            const decoder = req.app.get('decoder');

            let fx = await encoder.executeAsync(xt);
            let y = tf.zeros([1, 1, 3]);
            [y, fx] = await decoder.executeAsync([y, fx]);
            y = y.mul(modelParams.lbStd).add(modelParams.lbMean);
            const yd = y.dataSync();

            let pobj = {
                date: date,
                confirmed: yd[0],
                recovered: yd[1],
                deceased: yd[2]
            };

            pre = new Prediction(pobj);
            await pre.save();

            pre = [pobj]
        }

        pre = await Prediction.find({ date: date });
        res.status(200).json(pre);
    }

    catch (error) {
        res.status(500).json({ message: error.message });
    }
};