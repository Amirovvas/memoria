import { Request, Response, NextFunction } from "express";

const NETWORK_ERRORS = new Set(["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT"]);
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

  // the database host could not be reached (DNS, Wi-Fi or VPN hiccup): worth trying again, not a bug
  if (NETWORK_ERRORS.has(err?.code)) {
    return res.status(503).json({
      message: "Нет связи с базой данных. Проверьте интернет и попробуйте ещё раз",
    });
  }

  res.status(500).json({
    message: "Server is not working",
  });
};
