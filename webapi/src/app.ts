import "./lib/Env";
import express from "express";
import cors from "cors";
import routesAuth from "./routes/Api";
import routes from "./routes/Open";
import routeNotFound from "./routes/NotFound";
import bodyParser from "body-parser";
import GlobalExceptionHandler from "./middleware/GlobalExceptionHandler";
import { checkUnauthorized } from "./middleware/AuthJWT";

const app = express();

// Base Function
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Routes API
app.use("/api/open", routes);
app.use("/api", checkUnauthorized, routesAuth);
// Static assets
app.use("/data", express.static("data"));
// Routes 404
app.use(routeNotFound);
// Exception
app.use(GlobalExceptionHandler);

// Start App
app.listen(process.env.APP_PORT, () => {
    console.log(`Server is running on port ${process.env.APP_PORT}`);
});
