const Tonio = require("tonio-captions"),
     express = require("express"),
     async = require("./async-middleware"),
     bodyParser = require("body-parser"),
     config = require("./env.json");

const app = express(),
    port = 3000,
    tonio = new Tonio("https://services.tonio.com/api/v1/");

    tonio.initialize();

    tonio.logger.level = "info";

    tonio.signIn(config.email, config.password)
        .catch(error => console.log("An error happened while signing in to Tonio.", error));

    tonio.onAuthStateChange(isSignedIn => {
        console.log(`Is signed in: ${isSignedIn}.`);
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/events", 
    async( async (req, res) => {
        switch(req.body.type){
            case "signIn":{
                try{
                    let result = await tonio.signIn(config.email, config.password);

                    return res.status(200).json(result);
                }
                catch(error){
                    console.log("An error happened while singing in.", error);

                    return res.status(500).json(error.toObject());
                }
            }

            case "signOut":{
                try{
                    await tonio.signOut();

                    return res.status(200).json({
                        signedIn: false
                    });
                }
                catch(error){
                    console.log("An error happened while singing out.", error);

                    return res.status(500).json(error.toObject());
                }
            }

            case "start":{
                try{
                    let result = await tonio.startPerformance("testopera");

                    console.log("Start opera result.", result);
    
                    return res.status(200).json(result);
                }
                catch(error){
                    console.log("An error happened while starting performance.", error);

                    return res.status(500).json(error.toObject());
                }
            }

            case "end":{
                try{
                    let result = await tonio.endPerformance("testopera");

                    console.log("End opera result.", result);
    
                    return res.status(200).json(result);
                }
                catch(error){
                    console.log("An error happened while ending performance.", error);

                    return res.status(500).json(error.toObject());
                }
            }

            case "startInterval":{
                try{
                    let result = await tonio.startInterval("testopera");

                    console.log("Start interval result.", result);
    
                    return res.status(200).json(result);
                }
                catch(error){
                    console.log("An error happened while starting interval.", error);

                    return res.status(500).json(error.toObject());
                }
            }

            case "endInterval":{
                try{
                    let result = await tonio.endInterval("testopera");

                    console.log("End interval result.", result);
    
                    return res.status(200).json(result);
                }
                catch(error){
                    console.log("An error happened while ending interval.", error);

                    return res.status(500).json(error.toObject());
                }
            }

            case "sendCaption":{
                try{
                    let result = await  tonio.sendCaption("testopera", "-ZzGaWRsRAQ");

                    console.log("Caption sent result.", result);
    
                    return res.status(200).json(result);
                }
                catch(error){
                    console.log("An error happened while sending caption.", error);

                    return res.status(500).json(error.toObject());
                }
            }

            default:
                return res.status(500).json({
                    message: "Unknown type of the event."
                })
        }
    })); 
    
app.get('/', (req, res) => res.send("Tonio captions test is running."));
     
app.listen(port, () => {
   console.log(`App is listening at http://localhost:${port}`)
});

