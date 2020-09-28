"use strict"

const Tonio = require("./tonio"),
    TonioError = require("./tonio-error");

describe("Tonio", () => {
    let tonio = new Tonio(process.env.TONIO_URL);

    let measure = async (name, func) => {
        let start = performance.now();

        let result = await func();

        let end = performance.now();

        console.log(`${name} execution time: ${end - start} milliseconds.`);

        return result;
    };

    beforeEach(() => {
        tonio.initialize();

        tonio.logger = null;
    })

    afterEach(async () => {
        if(tonio.isInitialized){
            await tonio.destroy();
        }
    })

    it("throws Tonio error. Initialize for using Tonio first.", async () => {
        await tonio.destroy();

        await expect(tonio.signIn(process.env.EMAIL, process.env.PASSWORD)).rejects.toThrow(new TonioError("Please, initialize for using Tonio first."));
    });

    it("throws Tonio error. Tonio is already initialized.", () => {
        expect(() => tonio.initialize()).toThrow(new TonioError("Tonio is already initialized."));
    });

    it("throws Tonio error. You can't listen for authentication state without a callback function.", () => {
        expect(() => tonio.onAuthStateChange("callback")).toThrow(new TonioError("You can't listen for authentication state without a callback function."));
    });

    it("shows user is not authenticated in a callback.", async () => {
        await expect(new Promise(resolve => tonio.onAuthStateChange(isAuthenticated => resolve(isAuthenticated)))).resolves.toBe(false);
    });

    it("shows user is authenticated in a callback.", async () => {
        await tonio.signIn(process.env.EMAIL, process.env.PASSWORD);

        await expect(new Promise(resolve => tonio.onAuthStateChange(isAuthenticated => resolve(isAuthenticated)))).resolves.toBe(true);
    });

    it("throws Tonio error. An error happened while trying signing you in.", async () => {
        await expect(tonio.signIn("wrongemail@gmail.com", "wrongpassword")).rejects.toThrow(new TonioError("An error happened while trying signing you in."));
    });

    it("signs user in with email and password.", async () => {
        await expect(tonio.signIn(process.env.EMAIL, process.env.PASSWORD)).resolves.toBe();
    });

    it("signs user out successfully.", async () => {
        await tonio.signIn(process.env.EMAIL, process.env.PASSWORD);

        await expect(tonio.signOut()).resolves.toBe();
    });

    it("throws Tonio error. Please, sign in before using Tonio.", async () => {
        await expect(tonio.startPerformance(process.env.PERFORMANCE_ID)).rejects.toThrow(new TonioError("Please, sign in before using Tonio."));
    });

    it("starts performance.", async () => {
        if(!tonio.isSignedIn){
            await tonio.signIn(process.env.EMAIL, process.env.PASSWORD);
        }

        let performanceStart = await measure("Start performance", () => tonio.startPerformance(process.env.PERFORMANCE_ID));

        expect(performanceStart).toHaveProperty("performanceId", process.env.PERFORMANCE_ID);
        expect(performanceStart).toHaveProperty("actualStartTime");
    });

    it("starts interval.", async () => {
        if(!tonio.isSignedIn){
            await tonio.signIn(process.env.EMAIL, process.env.PASSWORD);
        }

        let interval = await measure("Start interval", () => tonio.startInterval(process.env.PERFORMANCE_ID));

        await tonio.endInterval(process.env.PERFORMANCE_ID);

        expect(interval).toHaveProperty("startTime");
        expect(interval).toHaveProperty("startTimeInTrack");
    });

    it("ends interval.", async () => {
        if(!tonio.isSignedIn){
            await tonio.signIn(process.env.EMAIL, process.env.PASSWORD);
        }

        let intervalStart = await tonio.startInterval(process.env.PERFORMANCE_ID);

        let intervalEnd = await measure("End interval", () => tonio.endInterval(process.env.PERFORMANCE_ID));

        expect(intervalEnd).toHaveProperty("intervalId");
        expect(intervalEnd).toHaveProperty("startTime", intervalStart.startTime);
        expect(intervalEnd).toHaveProperty("startTimeInTrack", intervalStart.startTimeInTrack);
        expect(intervalEnd).toHaveProperty("endTime");
        expect(intervalEnd).toHaveProperty("endTimeInTrack");
    });

    it("sends caption.", async () => {
        if(!tonio.isSignedIn){
            await tonio.signIn(process.env.EMAIL, process.env.PASSWORD);
        }

        let caption = await measure("Send caption", () => tonio.sendCaption(process.env.PERFORMANCE_ID, process.env.CAPTION_ID));

        expect(caption).toHaveProperty("captionId", process.env.CAPTION_ID);
        expect(caption).toHaveProperty("activeTime");
        expect(caption).toHaveProperty("timeInTrack");
    });

    it("ends performance.", async () => {
        if(!tonio.isSignedIn){
            await tonio.signIn(process.env.EMAIL, process.env.PASSWORD);
        }

        let performanceEnd = await measure("End performance", () => tonio.endPerformance(process.env.PERFORMANCE_ID));

        expect(performanceEnd).toHaveProperty("performanceId", process.env.PERFORMANCE_ID);
        expect(performanceEnd).toHaveProperty("actualEndTime");
    });
});