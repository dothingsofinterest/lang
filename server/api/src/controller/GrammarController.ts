import { Request, Response, NextFunction } from "express";
import { ServiceError } from "../exception/CustomError";
import { doList, doInsert, doUpdate, doDelete, exist } from "../service/Grammar";

const conList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const keyword: string = req.query.keyword?.toString() || "";
        const orderType: string = req.query.orderType?.toString() || "";
        const pageSize: number = parseInt(req.query.pageSize as string) || 10;
        const pageNo: number = parseInt(req.query.pageNo as string) || 1;
        const data = await doList({ keyword, orderType, pageSize, pageNo });
        res.json({
            code: 1,
            message: "success",
            data: data,
        });
    } catch (error) {
        next(error);
    }
};

const conInsert = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        if (name === undefined || name.length === 0 || name.length > 255) {
            throw new ServiceError("name length is between 1 and 255");
        }
        const [one] = await exist(name);
        if (one[0]) {
            throw new ServiceError(`Duplicate entry ${name}`);
        }
        const [result] = await doInsert(req.body);
        res.json({
            code: result.affectedRows ? 1 : 0,
            message: result.affectedRows ? "Success" : "Failed",
        });
    } catch (error) {
        next(error);
    }
};

const conUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ID: number = parseInt(req.params.id as string);
        const { name } = req.body;
        if (!ID) {
            throw new ServiceError("ID is required");
        }
        if (name === undefined || name.length === 0 || name.length > 255) {
            throw new ServiceError("name length is between 1 and 255");
        }
        const [result] = await doUpdate(req.body, ID);
        res.json({
            code: result.affectedRows ? 1 : 0,
            message: result.affectedRows ? "Success" : "Failed",
        });
    } catch (error) {
        next(error);
    }
};

const conDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ID: number = parseInt(req.params.id as string);
        if (!ID) throw new ServiceError("ID is required");
        const [result] = await doDelete(ID);
        res.json({
            code: result.affectedRows ? 1 : 0,
            message: result.affectedRows ? "Success" : "Failed",
        });
    } catch (error) {
        next(error);
    }
};

export { conList, conInsert, conUpdate, conDelete };
