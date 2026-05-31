
const errorHandler = (err, req, res, next) => {
    res.status(err.status || 500).json({ 
        status: 'error',
        message: err.message || 'An unexpected error occurred!' });
};
export default errorHandler;