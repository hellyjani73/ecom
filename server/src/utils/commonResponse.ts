// commonResponse.ts
interface CommonResponse<T> {
    success: boolean;
    data: T | null;
    message: string;
}

const commonResponse = <T>(success: boolean, data: T | null, message: string): CommonResponse<T> => {
    return {
        success,
        data: data !== undefined && data !== null ? data : null,  // Ensures null is returned, not {}
        message: typeof message === 'string' ? message : '',
    };
};

export { commonResponse };

export const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);
