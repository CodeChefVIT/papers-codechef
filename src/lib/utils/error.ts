import { failure } from "@/lib/utils/response"

export class CustomError extends Error {
    status: number;
    
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}

export function customErrorHandler(error: unknown, defaultMessage: string) {
    if (error instanceof CustomError) {
        return failure(error.message, error.status);
    } else {
        return failure(defaultMessage, 500)
    }
}
