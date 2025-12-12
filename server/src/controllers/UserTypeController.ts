import { UserTypeService } from "../services/UserTypeService";
import { commonResponse } from "../utils/commonResponse";
import { Request, Response } from 'express';

export class UserTypeController {
    private userTypeService: UserTypeService;

    constructor() {
        this.userTypeService = new UserTypeService();
    }

    public async GetAll(req: Request, res: Response) {
        try {
            const userTypes = await this.userTypeService.GetAll();

            return res.status(200).json(commonResponse(true, userTypes, 'User type retrieved successfully'));
        } catch (error: unknown) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'An unknown error occurred'));
        }
    };
}