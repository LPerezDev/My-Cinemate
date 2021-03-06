// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const capitalized = require("./utils/capitalized");
const projectName = "MyCinemate";

app.locals.appTitle = `${capitalized(projectName)}`;

app.use((req, res, next) => {
    if(!req.session.currentUser) {
        if(req.session.lang !== 'es') {
            app.set('view options', { layout: 'en-logged-out-layout' });
        } else {
            app.set('view options', { layout: 'es-logged-out-layout' });

        }
    } else {
        if(req.session.lang !== 'es') {
            app.set('view options', { layout: 'en-logged-in-layout' });
        } else {
            app.set('view options', { layout: 'es-logged-in-layout' });
        }
    }
    next()
});


// 👇 Start handling routes here
const index = require("./routes/index.routes");
app.use("/", index);

const authRoutes = require("./routes/auth.routes");
app.use("/", authRoutes);

const postRoutes = require("./routes/post.routes");
app.use("/", postRoutes);

const commentRoutes = require("./routes/comment.routes");
app.use("/", commentRoutes);

const watchlistRoutes = require("./routes/watchlist.routes");
app.use("/", watchlistRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
