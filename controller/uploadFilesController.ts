import { Request, Response } from "express";


export const loadFile = async (req: Request, resp: Response) => {

    resp.status(200).json({
        status: true,
        data: {

        }
    });
}