import { NextFunction, Request, Response } from "express";

export const parseFormData = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  } else {
    if (req.body.price !== undefined) {
      req.body.price = Number(req.body.price);
    }
    if (req.body.isPublished !== undefined) {
      req.body.isPublished = req.body.isPublished === "true" || req.body.isPublished === true;
    }
  }
  next();
};
