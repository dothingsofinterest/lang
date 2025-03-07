import express, { Request, Response, NextFunction } from "express";

const router = express.Router();

router.all("*", (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ error: "Not Found" });
});

export default router;
