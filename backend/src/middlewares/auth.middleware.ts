import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../services/token.service";
import { apiErrors } from "../utils/apiErrors";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string };
  }
}

/** Requires `Authorization: Bearer <accessToken>` and puts the user id on `req.user`. */
export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next(apiErrors.unauthorized("Требуется вход"));
  try {
    req.user = { id: verifyAccessToken(header.slice(7)) };
    next();
  } catch (error) {
    next(error);
  }
};
