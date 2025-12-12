import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { commonResponse } from '../utils/commonResponse';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public async saveUpdateUserController(req: Request, res: Response) {
        try {
            const result = await this.userService.saveOrUpdateUser(req);

            if (!result.success) {
                return res.status(200).json(commonResponse(false, null, result.message));
            }

            return res.status(200).json(commonResponse(true, result.user, result.message));
        } catch (error) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'An unknown error occurred'));
        }
    };

    public async getUserTypesController(req: Request, res: Response) {
        try {
            const userTypes = await this.userService.getUserTypes();
            return res.status(200).json(commonResponse(true, userTypes, "User types fetched successfully."));
        } catch (error) {
            return res.status(200).json(commonResponse(false, null, "Internal server error."));
        }
    };

    public async getModules(req: Request, res: Response) {
        try {
            const modules = await this.userService.getAllModules();

            return res.status(200).json(commonResponse(true, modules, 'Modules fetched successfully.'));
        } catch (error) {
            console.error('Error fetching modules:', error);
            return res.status(200).json(commonResponse(false, null, 'Internal server error.'));
        }
    };

    public async updateUserTypesController(req: Request, res: Response) {
        try {
            const { oldName, newName } = req.body;

            // Validate request data
            if (!oldName || !newName) {
                return res.status(200).json(commonResponse(false, null, "Both oldName and newName are required."));
            }

            const result = await this.userService.updateUserTypeName(req);

            if (result.modifiedCount === 0) {
                return res.status(404).json(commonResponse(false, null, "User type not found or already updated."));
            }

            return res.status(200).json(commonResponse(true, result, "User type updated successfully."));
        } catch (error) {
            console.error("Error updating user type:", error);
            return res.status(200).json(commonResponse(false, null, "Internal server error."));
        }
    };

    public async addUserTypeController(req: Request, res: Response) {
        try {
            const { name } = req.body;

            // Validate input
            if (!name) {
                return res.status(200).json(commonResponse(false, null, "User type name is required."));
            }

            const { newUserType, message } = await this.userService.addUserType(req);

            return res.status(200).json(commonResponse(true, newUserType, message));
        } catch (error) {
            console.error("Error updating user type:", error);
            return res.status(200).json(commonResponse(false, null, "Internal server error."));
        }
    };

    public async getAllUserList(req: Request, res: Response) {
        try {
            const { vendorId } = req.params;

            if (!vendorId) {
                return res.status(200).json(commonResponse(false, null, "vendorId is required."));
            }

            const { userList, message } = await this.userService.getAllUserList(vendorId);

            return res.status(200).json(commonResponse(true, userList, message));
        } catch (error) {
            console.error("Error updating user type:", error);
            return res.status(200).json(commonResponse(false, null, "Internal server error."));
        }
    };

    public async GetVendorUserById(req: Request, res: Response) {
        try {

            const { userDetails, message } = await this.userService.GetVendorUserById(req);

            return res.status(200).json(commonResponse(true, userDetails, message));
        } catch (error) {
            return res.status(200).json(commonResponse(false, null, "Internal server error."));
        }
    };

    public async DeleteVendorUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) return res.status(200).json({ success: false, message: 'User ID is required' });

            const message = await this.userService.DeleteVendorUserById(req);
            return message
                ? res.status(200).json({ success: true, message })
                : res.status(200).json({ success: false, message: 'User not found' });

        } catch (error: any) {
            return res.status(200).json({ success: false, message: error.message });
        }
    };

    public async resetPassword(req: Request, res: Response) {
        try {
            const { success, message } = await this.userService.resetPassword(req);
            return res.status(200).json(commonResponse(success, null, message));
        } catch (error: any) {
            return res.status(200).json({ success: false, message: error.message });
        }
    };
}
