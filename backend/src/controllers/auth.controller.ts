import { CookieOptions, NextFunction, Request, Response } from "express";
import { config } from "../config";
import { getProfile, loginUser, registerUser, updateProfile } from "../services/auth.service";
import { revokeRefreshToken, rotateTokens } from "../services/token.service";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.isProd,
  // site-wide, so the frontend's proxy can see on page requests whether a session exists
  path: "/",
  maxAge: config.refreshTokenDays * 24 * 60 * 60 * 1000,
};

// clearCookie must not get maxAge, otherwise Express sets a fresh expiry instead of removing it
const { maxAge: _maxAge, ...clearCookieOptions } = refreshCookieOptions;

export const registerController = async (
  req: Request<{}, {}, { name: string; email: string; password: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user, tokens } = await registerUser(req.body ?? {});
    res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions);
    res.status(201).json({
      message: "registered successfully",
      user,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user, tokens } = await loginUser(req.body ?? {});
    res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions);
    res.status(200).json({
      message: "logged in",
      user,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    const result = await rotateTokens(token);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    res.status(200).json({
      message: "refreshed",
      accessToken: result.accessToken,
    });
  } catch (error) {
    res.clearCookie("refreshToken", clearCookieOptions);
    next(error);
  }
};

export const profileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getProfile(req.user!.id);
    res.status(200).json({
      message: "profile",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfileController = async (
  req: Request<{}, {}, { name?: string; email?: string; currentPassword?: string; newPassword?: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await updateProfile(req.user!.id, req.body ?? {});
    res.status(200).json({
      message: "profile updated",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    await revokeRefreshToken(token);
    res.clearCookie("refreshToken", clearCookieOptions);
    res.status(200).json({
      message: "logged out",
    });
  } catch (error) {
    next(error);
  }
};
