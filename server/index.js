const config = require("./config");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const session = require("express-session"); //session managment
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

//Middleware

// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

// parse application/json
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true
  })
);

//session managment
//initializing session
// app.use(session({
//     secret: 'ijegoierjgoiemrjgoiem',
//     resave: false,
//     saveUninitialized: false,
//     // cookie: { secure: true }
// }))
mongoose.connect(
  config.dbString,
  {
    useNewUrlParser: true
  },
  (err, res) => {
    if (err) throw err;
    console.log("DB online ONLINE");
  }
);

app.use(
  session({
    secret: "ijegoierjgoiemrjgoiem",
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    }),
    resave: false,
    saveUninitialized: true,
    vcookie: {
      httpOnly: true,
      maxAge: 2419200000
    } // configure when sessions expires
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
  done(null, user_id);
});

//levantando telegram bot
require("./chatbot/Telegram/telegramBot");
app.use("", require("./routes/api/telegram.js"));

const routes = require("./routes/api/api.js");
app.use("/api", routes);

//Handle Production
if (process.env.NODE_ENV === "production") {
  //static folder
  app.use(express.static(__dirname + "/public"));
  //Handle SPA
  app.get(/.*/, (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
  });
}
process.env.PORT = process.env.PORT || 3000;
app.listen(process.env.PORT, () => {
  console.log(`Server starting on port ${process.env.PORT}`);
});
