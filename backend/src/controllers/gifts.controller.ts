import { NextFunction, Request, Response } from "express";
import { createGift, deleteGift, getPublicGift, listGifts, saveGiftFile } from "../services/gifts.service";

type Handler = (req: Request<{ id: string }>, res: Response) => Promise<void>;

const handle =
  (fn: Handler) =>
  (req: Request<{ id: string }>, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

/* ---------- the owner's gifts (behind authMiddleware) ---------- */

export const listGiftsController = handle(async (req, res) => {
  res.status(200).json({ data: await listGifts(req.user!.id) });
});

export const createGiftController = handle(async (req, res) => {
  res.status(201).json({ data: await createGift(req.user!.id, req.body ?? {}) });
});

export const deleteGiftController = handle(async (req, res) => {
  await deleteGift(req.user!.id, req.params.id);
  res.status(204).end();
});

/** The body is the file itself (express.raw): a collage JPEG or a song. */
export const uploadGiftFileController = handle(async (req, res) => {
  res.status(201).json({ data: await saveGiftFile(req.user!.id, req.body, req.headers["content-type"]) });
});

/* ---------- what the QR code opens (public) ---------- */

export const publicGiftController = handle(async (req, res) => {
  res.status(200).json({ data: await getPublicGift(req.params.id) });
});
