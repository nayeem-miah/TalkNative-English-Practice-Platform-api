/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status';
import { jwtHelper } from "../utils/JwtHelper";
import ApiError from "../errors/apiError";
import config from "../config";

const auth = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            let user;

            let token = req.cookies.accessToken || req.headers.authorization;

            if (token) {
                if (token.startsWith("Bearer ")) {
                    token = token.substring(7);
                }
                const secret = config.jwt.accessToken as string;
                const verifyUser = jwtHelper.verifyToken(token, secret);
                user = verifyUser;
            }

            if (!user) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
            }

            req.user = user;

            if (roles.length && !roles.includes(user.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "You don't have permission to access this resource!");
            }

            next();
        }
        catch (err) {
            next(err);
        }
    }
}

export const optionalAuth = () => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            let token = req.cookies.accessToken || req.headers.authorization;

            if (token) {
                if (token.startsWith("Bearer ")) {
                    token = token.substring(7);
                }
                const secret = config.jwt.accessToken as string;
                const verifyUser = jwtHelper.verifyToken(token, secret);
                req.user = verifyUser;
            }
            next();
        }
        catch (err) {
            next();
        }
    }
}

export default auth;
