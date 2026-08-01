class apiError extends Error {
    constructor(statuscode,message="Something went wrong"){
        super(message);

        this.statuscode = statuscode;
        this.message = message;
        this.success = false;

        Error.captureStackTrace(this, this.constructor)

    }
}

export {apiError}