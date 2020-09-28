"use strict"

const axios = require("axios"),
    firebase = require("firebase"),
    TonioError = require("./tonio-error"),
    TonioLogger = require("./tonio-logger"),
    { DateTime } = require("luxon");

/**
 * Tonio client. Allows interaction with the Tonio service.
 */
class Tonio {
    /**
     * Gets whether user is signed in Tonio service or not.
     */
    get isSignedIn(){
        return this._firebase && this._firebase.auth().currentUser;
    }
    
    /**
     * Gets whether Tonio client is initialized or not.
     */
    get isInitialized(){
        return this._firebase !== null;
    }

    /**
     * Gets Tonio logger.
     */
    get logger(){
        return this._logger;
    }

    /**
     * Sets Tonio logger actual implementation.
     */
    set logger(newLogger){
        this._logger.logger = newLogger;
    }

    /**
     * Creates Tonio client.
     * @param {string} tonioUrl Tonio service base url.
     */
    constructor(tonioUrl){
        this._tonioUrl = tonioUrl;

        this._logger = new TonioLogger();

        this._firebase = null;
    }

    /**
     * Initializes Tonio client. Should be called only once.
     */
    initialize(){
        try{
            this._logger.info("Initializing Tonio client.");

            if(firebase.apps.length !== 0) {
                throw new TonioError("Tonio is already initialized.")
                        .addError("Tonio should be initialized only once.");
            }

            let config = require("./env.json");
    
            this._firebase = firebase.initializeApp(config.firebase);

            this._logger.info("Successfully finished initialization of Tonio client.");
        }
        catch(error){
            this._logger.error("An error occured while initializing Tonio client.", error);

            if(error instanceof TonioError){
                throw error;
            }
            else{
                throw new TonioError("An error happened while initializing Tonio client.")
                    .causedBy(error);
            }
        }
    }

    /**
     * Destroys Tonio client. Frees the resources of all associated services.
     */
    async destroy(){
        try{
            this._logger.info("Destroying Tonio client.");

            if(!this.isInitialized){
                throw new TonioError("Can't destroy not initialized Tonio client.")
                    .addError("You haven't initialized Tonio.");
            }

            await this._firebase.delete();

            this._firebase = null;

            this._logger.info("Successfully destroyed Tonio client.");
        }
        catch(error){
            this._logger.error("An error occured while destroying Tonio client.", error);

            if(error instanceof TonioError){
                throw error;
            }
            else{
                throw new TonioError("An error happened while destroying Tonio client.")
                    .causedBy(error);
            }
        }
    }

    /**
     * Sets authentication state callback that is called every time when authentication state has been changed.
     * @param {Function} authStateCallback Authentication state callback.
     */
    onAuthStateChange(authStateCallback){
        try{
            this._logger.info("Setting authentication state callback.");

            if(!this.isInitialized){
                throw new TonioError("Please, initialize for using Tonio first.")
                    .addError("You haven't initialized Tonio.");
            }
    
            if(!(authStateCallback instanceof Function)){
                throw new TonioError("You can't listen for authentication state without a callback function.")
                    .addError("It is not a callback function.");
            }
    
            this._firebase.auth().onAuthStateChanged(user => authStateCallback(user !== null));

            this._logger.info("Authentication state callback has been set successfully.");
        }
        catch(error){
            this._logger.error("An error occured while setting authentication state callback.", error);

            if(error instanceof TonioError){
                throw error;
            }
            else{
                throw new TonioError("An error happened while adding on auth state callback.")
                    .causedBy(error);
            }
        }
    }

    /**
     * Signs in user with email and password.
     * @param {string} email User email.
     * @param {string} password User password.
     */
    async signIn(email, password){
        try{    
            this._logger.info(`Signing in user ${email} in to Tonio service.`);

            if(!this.isInitialized){
                throw new TonioError("Please, initialize for using Tonio first.")
                    .addError("You haven't initialized Tonio.");
            }

            if(this.isSignedIn){
                let signedInEmail = this._firebase.auth().currentUser.email;

                this._logger.info(`User ${signedInEmail} is already signed in to Tonio service.`);

                return;
            }
    
            await this._firebase.auth().signInWithEmailAndPassword(email, password);

            this._logger.info(`User ${email} is successfully signed in to Tonio service.`);
        }
        catch(error){
            this._logger.error(`An error occured while signing user ${email} in to Tonio service.`, error);

            if(error instanceof TonioError){
                throw error;
            }
            else{
                throw new TonioError("An error happened while trying signing you in.")
                    .causedBy(error);
            }
        }
    }

    /**
     * Signs user out.
     */
    async signOut(){
        try{
            this._logger.info("Signing out user from Tonio service.");

            if(!this.isInitialized){
                throw new TonioError("Please, initialize for using Tonio first.")
                    .addError("You haven't initialized Tonio.");
            }

            if(this.isSignedIn){
                let signedInEmail = this._firebase.auth().currentUser.email;

                this._logger.info(`Signing out user ${signedInEmail} from Tonio service.`);

                await this._firebase.auth().signOut();
            }
            else{
                this._logger.info("Can't sign out user. No one is signed in to Tonio right now.");
            }
        }
        catch(error){
            this._logger.error("An error occured while signing user out.", error);

            if(error instanceof TonioError){
                throw error;
            }
            else{
                throw new TonioError("An error happened while signing you out.")
                    .causedBy(error);
            }
        }
    }

    /**
     * Updates performance with the actual start time. Should be called when performance is started.
     * @param {number} performanceId Performance id.
     */
    async startPerformance(performanceId) {
        try{
            let event = {
                performanceId: performanceId,
                activeTime: DateTime.utc().toISO(),
                type: "start"
            };

            this._logger.info(`Starting performance ${event.performanceId} at ${event.activeTime}.`);
    
            if(!this.isInitialized){
                throw new TonioError("Please, initialize for using Tonio first.")
                    .addError("You haven't initialized Tonio.");
            }
    
            if(!this.isSignedIn){
                throw new TonioError("Please, sign in before using Tonio.")
                        .addError("You are not authenticated.");
            }

            this._logger.info("Sending request to Tonio service.");
    
            let token = await this._firebase.auth().currentUser.getIdToken(false);
    
            let response =  await axios.post("/events", event, this.getConfig(token));
    
            let performance = response.data.performance;

            this._logger.info("Successfully received response with started performance.", performance);
    
            return {
                performanceId: performance.performanceId,
                actualStartTime: performance.actualStartTime
            }
        }
        catch(error){
            this._logger.error(`An error occured while starting performance ${performanceId}.`, error);

            if(error instanceof TonioError){
                throw error;
            }
            else{
                throw new TonioError("An error happened while starting performance.")
                    .causedBy(error);
            }
        }
    }

    /**
     * Updates performance with the actual end time. Should be called when performance is ended.
     * @param {number} performanceId Performance id.
     */
    async endPerformance(performanceId) {
        try{
            let event = {
                performanceId: performanceId,
                activeTime: DateTime.utc().toISO(),
                type: "end"
            };

            this._logger.info(`Ending performance ${event.performanceId} at ${event.activeTime}.`);
    
            if(!this.isInitialized){
                throw new TonioError("Please, initialize for using Tonio first.")
                    .addError("You haven't initialized Tonio.");
            }
    
            if(!this.isSignedIn){
                throw new TonioError("Please, sign in before using Tonio.")
                        .addError("You are not authenticated.");
            }

            this._logger.info("Sending request to Tonio service.")
    
            let token = await this._firebase.auth().currentUser.getIdToken(false);
    
            let response = await axios.post("/events", event, this.getConfig(token));
    
            let performance = response.data.performance;

            this._logger.info("Successfully received response with ended performance.", performance);
    
            return {
                performanceId: performance.performanceId,
                actualEndTime: performance.actualEndTime
            }
        }
        catch(error){
            this._logger.error(`An error occured while ending performance ${performanceId}.`, error);

            if(error instanceof TonioError){
                throw error;
            }
            else{
                throw new TonioError("An error happened while ending performance.")
                    .causedBy(error);
            }
        }
    }

    /**
     * Adds performance interval. Should be called when performance interval is started.
     * @param {number} performanceId Performance id where interval belongs to.
     */
    async startInterval(performanceId) {
        try{
            let event = {
                performanceId: performanceId,
                activeTime: DateTime.utc().toISO(),
                type: "intervalStart"
            };
            
            this._logger.info(`Starting interval for performance ${event.performanceId} at ${event.activeTime}.`);

            if(!this.isInitialized){
                throw new TonioError("Please, initialize for using Tonio first.")
                    .addError("You haven't initialized Tonio.");
            }
    
            if(!this.isSignedIn){
                throw new TonioError("Please, sign in before using Tonio.")
                        .addError("You are not authenticated.");
            }

            this._logger.info("Sending request to Tonio service.")
    
            let token = await this._firebase.auth().currentUser.getIdToken(false);
    
            let response = await axios.post("/events", event, this.getConfig(token));
    
            let interval = response.data.interval;

            this._logger.info("Successfully received response with started interval.", interval);
    
            return interval;
        }
        catch(error){
            this._logger.error(`An error occured while starting interval for performance ${performanceId}.`, error);

            if(error instanceof TonioError){
                throw error;
            }
            else{
                throw new TonioError("An error happened while starting interval.")
                    .causedBy(error);
            }
        }
    }

    /**
     * Ends performance interval. Should be called when performance interval is ended.
     * @param {number} performanceId Performance id where interval belongs to.
     */
    async endInterval(performanceId) {
        try{
            let event = {
                performanceId: performanceId,
                activeTime: DateTime.utc().toISO(),
                type: "intervalEnd"
            };

            this._logger.info(`Ending interval for performance ${event.performanceId} at ${event.activeTime}.`);
    
            if(!this.isInitialized){
                throw new TonioError("Please, initialize for using Tonio first.")
                    .addError("You haven't initialized Tonio.");
            }
    
            if(!this.isSignedIn){
                throw new TonioError("Please, sign in before using Tonio.")
                        .addError("You are not authenticated.");
            }

            this._logger.info("Sending request to Tonio service.")
    
            let token = await this._firebase.auth().currentUser.getIdToken(false);
    
            let response = await axios.post("/events", event, this.getConfig(token));

            let interval = response.data.interval;

            this._logger.info("Successfully received response with ended interval.", interval);
    
            return interval;
        }
        catch(error){
            this._logger.error(`An error occured while ending interval for performance ${performanceId}.`, error);

            if(error instanceof TonioError){
                throw error;
            }
            else{
                throw new TonioError("An error happened while ending interval.")
                    .causedBy(error);
            }
        }
    }

    /**
     * Sends performance caption. Should be called when performance caption is shown.
     * @param {number} performanceId Performance id where caption belongs to.
     * @param {number} captionId Caption id that is shown.
     */
    async sendCaption(performanceId, captionId) {
        try{
            let captionPatch = {
                performanceId: performanceId,
                captionId: captionId,
                activeTime: DateTime.utc().toISO()
            };

            this._logger.info(`Sending caption ${captionPatch.captionId} for performance ${captionPatch.performanceId} at ${captionPatch.activeTime}.`);
    
            if(!this.isInitialized){
                throw new TonioError("Please, initialize for using Tonio first.")
                    .addError("You haven't initialized Tonio.");
            }
    
            if(!this.isSignedIn){
                throw new TonioError("Please, sign in before using Tonio.")
                        .addError("You are not authenticated.");
            }

            this._logger.info("Sending request to Tonio service.")
    
            let token = await this._firebase.auth().currentUser.getIdToken(false);
    
            let response = await axios.patch("/captions", captionPatch, this.getConfig(token));
    
            let caption = response.data.caption;

            this._logger.info("Successfully received response with sent caption.", caption);
    
            return {
                captionId: caption.captionId,
                activeTime: caption.activeTime,
                timeInTrack: caption.timeInTrack
            };
        }
        catch(error){
            this._logger.error(`An error occured while sending caption ${captionId} for  performance ${performanceId}.`, error);

            if(error instanceof TonioError){
                throw error;
            }
            else{
                throw new TonioError("An error happened while sending caption.")
                    .causedBy(error);
            }
        }
    }

    /**
     * Gets Tonio service configuration.
     * @param {string} token Firebase authentication token.
     * @private
     */
    getConfig(token){
        if(!this._tonioUrl){
            throw new TonioError("Incorrect Tonio service configuration.")
                    .addError("Tonio service url is not defined.");
        }

        return {
            baseURL: this._tonioUrl,
            headers: {
                "Content-Type": "application/json",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept": "application/json",
                "Connection": "keep-alive",
                "Authorization": `Bearer ${token}`
            }
        }
    }
}

module.exports = Tonio;