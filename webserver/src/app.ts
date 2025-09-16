import "./lib/Env";
import express from "express";
import routeNotFound from "./routes/NotFound";
import bodyParser from "body-parser";
import path from "path";
import GlobalExceptionHandler from "./middleware/GlobalExceptionHandler";

const app = express();

// Base Function
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes Static
app.use(express.static(path.join(__dirname, "./views")));

// Routes Entry
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./views", "index.html"));
});

// Routes 404
app.use(routeNotFound);
// Exception
app.use(GlobalExceptionHandler);

const server = app.listen(process.env.APP_PORT, () => {
    console.log(`Server is running on port ${process.env.APP_PORT}`);
});
