import "./lib/Env";
import express from "express";
import cors from "cors";
import routes from "./routes/Api";
import routesOpen from "./routes/Open";
import routeNotFound from "./routes/NotFound";
import bodyParser from "body-parser";
import GlobalExceptionHandler from "./middleware/GlobalExceptionHandler";
import { checkUnauthorized } from "./middleware/AuthJWT";

const app = express();

// Base Function
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/open", routesOpen);
app.use("/api", checkUnauthorized, routes);
app.use(routeNotFound);

// Exception
app.use(GlobalExceptionHandler);

const server = app.listen(process.env.APP_PORT, () => {
    console.log(`Server is running on port ${process.env.APP_PORT}`);
});
