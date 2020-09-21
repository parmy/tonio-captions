"use strict"

var winston = require("winston");

require("winston-daily-rotate-file");

/**
 * Tonio logger. Wraps actual logger implementation.
 */
class TonioLogger{
    /**
     * Gets default winston logger log level.
     */
    get level(){
        return this._tonioTransport.level;
    }

    /**
     * Sets default winston logger log level.
     */
    set level(logLevel){
        this._tonioTransport.level = logLevel;
    }

    /**
     * Gets actual logger implementation instance.
     */
    get logger(){
        return this._logger;
    }

    /**
     * Sets actual logger implementation instance or null if you dont want logs.
     */
    set logger(newLogger){
        this._logger = newLogger;
    }

    /**
     * Creates Tonio logger with default winston configuration.
     */
    constructor(){
        this._tonioTransport = new winston.transports.DailyRotateFile({
                            filename: "tonio-%DATE%.log",
                            dirname: "./node_modules/tonio-captions/logs",
                            maxSize: "20m",
                            maxFiles: "7d",
                            level: "error",
                            utc: true
                        });

        this._logger = winston.createLogger({
                            format: winston.format.combine(
                                winston.format.timestamp(),
                                winston.format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
                                winston.format.json()
                            ),
                            transports: [
                                this._tonioTransport
                            ]
                        });
    }

    /**
     * Adds log with info level.
     * @param {string} message Log message.
     * @param {any} obj Log object.
     */
    info(message, obj){
        if(!this._logger){
            return;
        }

        if(arguments.length === 1){
            this._logger.info(message);
        }

        if(arguments.length === 2){
            this._logger.info(message, obj);
        }
    }

    /**
     * Adds log with warn level.
     * @param {string} message Log message.
     * @param {any} obj Log object.
     */
    warn(message, obj){
        if(!this._logger){
            return;
        }

        if(arguments.length === 1){
            this._logger.info(message);
        }

        if(arguments.length === 2){
            this._logger.info(message, obj);
        }
    }

    /**
     * Adds log with error level.
     * @param {string} message Log message.
     * @param {any} obj Log object.
     */
    error(message, obj){
        if(!this._logger){
            return;
        }

        if(arguments.length === 1){
            this._logger.info(message);
        }

        if(arguments.length === 2){
            this._logger.info(message, obj);
        }
    }
}

module.exports = TonioLogger;