import { apiError } from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {

    const statusCode = err.statuscode || 500;

    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
        data: null,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });

};

export { errorHandler };
