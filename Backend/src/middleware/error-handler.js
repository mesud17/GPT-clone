
const errorHandler = (err, req, res, next) => {
    res.status(500).json({ 
        status: 'error',
        message: 'An unexpected error occurred!' });
};

export default errorHandler;