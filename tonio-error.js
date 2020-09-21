"use strict"

/**
 * Tonio error. Wraps every error that occurs in Tonio.
 */
class TonioError extends Error{
    /**
     * Gets additional errors.
     */
    get errors(){
        return this._errors;
    }

    /** 
     * Gets error stack trace.
     */
    get stackTrace(){
        let stackTrace = `Stack trace: ${this.stack}\n`;

        if(this._innerError && this._innerError instanceof Error){
            stackTrace += `Caused by ${this._innerError.stack}`;
        }

        return stackTrace;
    }

    /**
     * Creates Tonio error with message.
     * @param {string} message Error message.
     */
    constructor(message){
        if(!message){
            message = "Unexpected error occured in Tonio.";
        }

        super(message);

        this._errors = [];

        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Adds additional error to the list.
     * @param {string} error Additional error.
     */
    addError(error){
        if(error){
            this._errors.push(error);
        }

        return this;
    }

    /**
     * Sets error that caused this error.
     * @param {Error} error Internal error.
     */
    causedBy(error){
        if(error.response && error.response.data && error.response.data.error)
        {
            this._innerError = error.response.data.error;
        }
        else{
            this._innerError = error;
        }

        return this;
    }

    /**
     * Converts Tonio error to JSON object.
     */
    toObject(){
        return {
            message: this.message,
            stackTrace: this.stackTrace,
            innerError: this._innerError,
            errors: this._errors,
        };
    }
}

module.exports = TonioError;