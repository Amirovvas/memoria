import { Request, Response, NextFunction } from "express";
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // malformed JSON body from express.json()
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Некорректный JSON",
    });
  }

  if (err?.status && err?.message) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  // details stay in the server log; the client never sees internal error text
  console.error(`${req.method} ${req.originalUrl}`, err);
  res.status(500).json({
    message: "Server is not working",
  });
};
