/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../config";
const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (config.node_env === "development") {
        console.log("server error", err);
    }

    let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let message = err.message || "Something went wrong!";
    let error = err;
    const success = false;

    // Prisma known errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            statusCode = httpStatus.CONFLICT;
            message = "Duplicate key error!";
            error = err.meta;
        }

        if (err.code === "P1000") {
            statusCode = httpStatus.BAD_GATEWAY;
            message = "Authentication failed against database server";
            error = err.meta;
        }

        if (err.code === "P2003") {
            statusCode = httpStatus.BAD_REQUEST;
            message = "Foreign key constraint failed";
            error = err.message;
        }

        if (err.code === "P2025") {
            statusCode = httpStatus.NOT_FOUND;
            message = "No record was found for your query.";
        }

        if (err.code === "P2023") {
            statusCode = httpStatus.BAD_REQUEST;
            message = "Invalid ID format or Malformed ObjectID";
            error = err.meta;
        }

        if (err.code === "P2014") {
            statusCode = httpStatus.BAD_REQUEST;
            message =
                "This product cannot be deleted because it is already used in one or more orders.";
            error = {
                reason: "Product is linked with order items",
            };
        }
    }

    // Prisma validation error
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        message = "Validation error!";
        error = err.message;
    }

    // Zod error (SAFE)
    else if (err?.name === "ZodError" && Array.isArray(err?.issues)) {
        statusCode = httpStatus.BAD_REQUEST;
        message = err.issues.map((i: any) => i.message).join(", ");
        error = err.issues;
    }

    res.status(statusCode).json({
        success,
        message,
        error,
    });
};


export default globalErrorHandler;