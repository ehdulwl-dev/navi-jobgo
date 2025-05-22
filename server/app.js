const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const session = require("express-session");

const dotenv = require("dotenv");
const nodeEnv = process.env.NODE_ENV || "loc";
dotenv.config({ path: path.resolve(__dirname, `.env.${nodeEnv}`) });

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8081";


const sessionRouter = require("./routes/session");
const authRoutes = require("./routes/auth");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const resumesRouter = require("./routes/resumes");
const jobsRouter = require("./routes/jobs");
const educationsRouter = require("./routes/educations");


app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

const passport = require("./services/passport");
app.use(passport.initialize());
app.use(passport.session());

require("./services/seoulApiScheduler");

app.use(logger("dev"));
app.use(cookieParser());

// API 라우팅
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/resumes", resumesRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/educations", educationsRouter);
app.use("/auth", authRoutes);
app.use("/session", sessionRouter);


// // 정적 파일 및 SPA 라우팅
if (process.env.NODE_ENV === "prod") {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  });
}


module.exports = app;
