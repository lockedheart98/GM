var mongoose = require("mongoose");
var gracefulShutdown;
var dbURI = "mongodb://localhost/Loc8r";
require("./locations");
mongoose.connect(dbURI);


// windown
var readline = require("readline");
if (process.platform === "win32") {
    var rl = readline.createInterface ({
        input: process.stdin,
        output: process.stdout
    });
    rl.on("SIGINT", function () {
        process.emit("SIGINT");
    });
}


// listen for mongoose connection events ad output statues to console
mongoose.connection.on("connected", function () {
    console.log("Mongoose connected to " + dbURI);
});
mongoose.connection.on("error", function (err) {
    console.log("Mongoose connection error" + err);
});
mongoose.connection.on("disconnected", function () {
    console.log("Mongoose disconnected");
});

// reusable function to close mongoose connection
gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () {
        console.log("Mongoose disconnected through " + msg);
        callback();
    });
};

// listen to node
// for nodemon restarts
process.once("SIGUSR2", function () {
    gracefulShutdown("Nodemon restart", function () {
        process.kill(process.pid, "SIGUSR2");
    });
});
// for app termination
process.on("SIGINT", function () {
    gracefulShutdown("App termination", function () {
        process.exit(0);
    });
});
// for heroku app termination
process.on("SIGTERM", function () {
    gracefulShutdown("Heroku app shutdown", function () {
        process.exit(0);
    })
});