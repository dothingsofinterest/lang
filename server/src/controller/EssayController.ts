import { Request, Response, NextFunction } from "express";
import { ServiceError } from "../exception/CustomError";
import { doList, doInsert, doUpdate, doDelete, findByTitle } from "../service/Essay";

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
        const { title } = req.body;
        if (title === undefined || title.length === 0 || title.length > 255) {
            throw new ServiceError("title length is between 1 and 255");
        }
        const [one] = await findByTitle(title);
        if (one[0]) {
            throw new ServiceError(`Duplicate entry ${title}`);
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
        const { title } = req.body;
        if (!ID) {
            throw new ServiceError("ID is required");
        }
        if (title === undefined || title.length === 0 || title.length > 255) {
            throw new ServiceError("title length is between 1 and 255");
        }
        const [one] = await findByTitle(title);
        if (one[0] && one[0].id != ID) {
            throw new ServiceError(`Duplicate entry ${title}`);
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
