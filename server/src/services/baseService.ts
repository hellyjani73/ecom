import { AuthenticatedRequest } from '../middleware/middleware';

export class BaseService {


    protected getUserId(req: AuthenticatedRequest): string | null {
        return req.user?.userId || null;
    }

    protected getUserRole(req: AuthenticatedRequest): string | null {
        return req.user?.role || null;
    }
}

