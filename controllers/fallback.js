export const getDaily = async (req, res) => {
    const data = req.app.get('fdaily');
    res.status(200).json(data);
};

export const getTimeseries = async (req, res) => {
    const data = req.app.get('ftimeseries');
    res.status(200).json(data);
};