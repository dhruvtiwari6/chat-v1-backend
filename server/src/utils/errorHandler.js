const ApiError = require('./apiError');

function errorHandler(err, req, res, next) {
    // If error is not an instance of ApiError, convert it to a generic one
    if (!(err instanceof ApiError)) {
        console.error('Unexpected error:', err);
        err = new ApiError(500, 'Internal Server Error');
    }

    // Send JSON response with statusCode and message
    res.status(err.statusCode).json({
        status: 'error',
        statusCode: err.statusCode,
        message: err.message
    });
}

module.exports = errorHandler;
