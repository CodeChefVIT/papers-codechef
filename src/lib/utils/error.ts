import { NextResponse } from "next/server";

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
        return NextResponse.json(
            {message: error.message},
            {status: error.status}
        );
    } else {
        return NextResponse.json(
            {message: defaultMessage},
            {status: 500}
        );
    }
}