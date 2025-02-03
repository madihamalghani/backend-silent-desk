class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Global Error Handling Middleware
export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || 'Internal Server Error';
    err.statusCode = err.statusCode || 500;

    switch (err.name) {
        case 'CastError': // Invalid ObjectId format
            err.message = `Resource not found. Invalid ${err.path}`;
            err.statusCode = 400;
            break;
        case 'ValidationError': // Required field missing
            err.message = Object.values(err.errors).map(val => val.message).join(', ');
            err.statusCode = 400;
            break;
        case 'JsonWebTokenError': // Invalid JWT token
            err.message = 'JsonWebToken is invalid. Please try again';
            err.statusCode = 400;
            break;
        case 'TokenExpiredError': // Expired JWT token
            err.message = 'JsonWebToken has expired. Try again';
            err.statusCode = 400;
            break;
    }

    // Handle Duplicate Key Error (MongoDB Unique Constraint Violation)
    if (err.code === 11000) {
        err.message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err.statusCode = 400;
    }

    return res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};

// 404 Not Found Middleware
export const notFoundMiddleware = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Resource not found"
    });
};

export default ErrorHandler;
