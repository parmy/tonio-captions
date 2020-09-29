# tonio-captions

A client for interaction with the Tonio service. It allows vendors to provide live captions.

[![Version npm](https://img.shields.io/npm/v/tonio-captions.svg?style=flat-square)](https://www.npmjs.com/package/tonio-captions)[![npm Downloads](https://img.shields.io/npm/dm/tonio-captions.svg?style=flat-square)](https://npmcharts.com/compare/tonio-captions?minimal=true)

[![NPM](https://nodei.co/npm/tonio-captions.png?downloads=true&downloadRank=true)](https://nodei.co/npm/tonio-captions/)

## Table of contents

* [Table of Contents](#table-of-contents)
* [Installation](#installation)
* [Usage](#usage)
* [Authentication](#authentication)
* [Tonio API](#tonio-api)
* [Error Handling](#error-handling)
* [Logging](#logging)

# Installation

Install with `npm`

```
npm install tonio-captions --save
```

## Usage

The recommended way to use `tonio-captions` is to create Tonio client
with base Tonio service url and initialize it before first usage.
`tonio-captions` should be initialized only once:

``` js
const Tonio = require("tonio-captions");

//Provide base Tonio service url into constructor.
const tonio = new Tonio("https://api.tonio.com/v1/");

//Tonio should be initialized only once before first usage.
tonio.initialize();
```

You could check whether `tonio-captions` is initialized or not
by using `tonio.isInitialized` property:

``` js
console.log(`Initialized: ${tonio.isInitialized}.`);
```

After finishing working with `tonio-captions` is is recommended to free up
resources by using destroy method:

``` js
tonio.destroy();
```

## Authentication

After creation of instance and initialization of `tonio-captions`
you have to pass authentication. You could sign in to Tonio using 
your email and password via `tonio.signIn` method:

``` js
tonio.signIn("username", "password")
    .then(() => {
        console.log("Successfully signed in.");
    })
    .catch(error => {
        console.log(error);
    });
```

You could also subscribe to authentication state change 
by using `tonio.onAuthStateChange` method:

``` js
tonio.onAuthStateChange(isSignedIn => {
        console.log(`Signed in: ${isSignedIn}.`);
    });
```

If you dont want to use authentication state change callback
you could use `tonio.isSignedIn` property to find out if user
is signed in or not:

``` js
console.log(`Signed in: ${tonio.isSignedIn}.`);
```

To sign out from Tonio just call `tonio.signOut` method:

``` js
tonio.signOut()
    .then(() => {
        console.log("Successfully signed out.");
    })
    .catch(error => {
        console.log(error);
    });
```
## Tonio API

When performance started you should call `tonio.startPerformance`
method with performance id. It updates performance with the actual start time:

``` js
tonio.startPerformance("sn7Q3mYJmup3SxUFeas66M")
            .then(response => {
                console.log("Performance started successfully.", response);
            })
            .catch(error => {
                console.log("An error happened while starting performance.", error);
            });
```
When performance ended you should call `tonio.endPerformance`
method with performance id. It updates performance with the actual end time:

``` js
tonio.endPerformance("sn7Q3mYJmup3SxUFeas66M")
            .then(response => {
                console.log("Performance ended successfully.", response);
            })
            .catch(error => {
                console.log("An error happened while ending performance.", error);
            });
```
When during the performance an interval occures you should call
method `tonio.startInterval` with performance id to start the interval:

``` js
tonio.startInterval("sn7Q3mYJmup3SxUFeas66M")
            .then(response => {
                console.log("Interval started successfully.", response);
            })
            .catch(error => {
                console.log("An error happened while starting interval.", error);
            });
```

When started interval is ended you should call method
`tonio.endInterval` with performance id to end the interval:

``` js
tonio.endInterval("sn7Q3mYJmup3SxUFeas66M")
            .then(response => {
                console.log("Interval ended successfully.", response);
            })
            .catch(error => {
                console.log("An error happened while ending interval.", error);
            });
```

When certain caption should be shown during the performance
you should call `tonio.sendCaption` with performance id and 
caption id to send Tonio the caption:

``` js
tonio.sendCaption("sn7Q3mYJmup3SxUFeas66M", "-opceWusILY")
            .then(response => {
                console.log("Caption has been sent successfully.", response);
            })
            .catch(error => {
                console.log("An error happened while sending caption.", error);
            }); 
```
## Error Handling

If something is wrong during the Tonio methods invocation
`TonioError` would be thrown. It has stack trace and
additional errors array properties:

``` js
tonio.sendCaption("sn7Q3mYJmup3SxUFeas66M", "-opceWusILY")
            .then(response => {
                console.log("Caption has been sent successfully.", response);
            })
            .catch(error => {
                console.log("Additional errors.", error.errors);

                console.log("Stack trace.", error.stackTrace);
            }); 
```

You could also convert `TonioError` to JSON object:

``` js
tonio.startInterval("sn7Q3mYJmup3SxUFeas66M")
    .catch(error => console.log("An error happened while ending interval.", error.toObject()));
```

## Logging

By default Tonio uses `winston` library to log into file.
Default log level is `error` and log directory is `./node_modules/tonio-captions/logs`.
Logs are rotated every week or by size, `20m` is maximum size of log file.

You could change log level to `info` if you want to get more debug information:

``` js
tonio.logger.level = "info";
```

Or you could turn all logs off if you want to get rid of them:

``` js
tonio.logger = null;
```
Finally, you could replace the default logger with your own with `tonio.logger`
property. Keep in mind that your logger should implement following methods:

``` js
const functions = require("firebase-functions");

tonio.logger = functions.logger;

tonio.logger.info("Info log message.", { message: "Test info object." });

tonio.logger.warn("Warn log message.", { message: "Test warn object." });

tonio.logger.error("Error log message.", { message: "Test error object." });

```

## Promises

tonio-captions depends on a native ES6 Promise implementation to be [supported](http://caniuse.com/promises).
If your environment doesn't support ES6 Promises, you can [polyfill](https://github.com/jakearchibald/es6-promise).

## License

[MIT](LICENSE)
