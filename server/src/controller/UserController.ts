import { Request, Response, NextFunction } from "express";
import { ServiceError } from "../exception/CustomError";
import { doUpdate } from "../service/User";
import { checkString } from "../utils/Bcrypt";

const conUpdatePass = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { oldPassword = "", newPassword = "" } = req.body;
        if (!oldPassword || oldPassword.length < 6 || oldPassword.length > 16) {
            throw new ServiceError("oldPassword length is between 6 and 16");
        }
        if (!newPassword || newPassword.length < 6 || newPassword.length > 16) {
            throw new ServiceError("newPassword length is between 6 and 16");
        }
        const compare = await checkString(oldPassword, req.user?.password_hashed || "");
        if (!compare) {
            throw new ServiceError("oldPassword is wrong");
        }
        const [result] = await doUpdate({ newPassword }, req.user?.id || 0);
        res.json({
            code: result.affectedRows ? 1 : 0,
            message: result.affectedRows ? "Success" : "Failed",
        });
    } catch (error) {
        next(error);
    }
};

export { conUpdatePass };
