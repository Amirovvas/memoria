import express, { Router } from "express";
import {
  createGiftController,
  deleteGiftController,
  listGiftsController,
  publicGiftController,
  uploadGiftFileController,
} from "../controllers/gifts.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

/** Surprise pages: the owner manages them, anyone with the link opens one. */
export const giftsRouter = Router();

const rawFile = express.raw({ type: ["image/jpeg", "audio/*"], limit: "15mb" });

giftsRouter.get("/public/gifts/:id", publicGiftController);

giftsRouter.use(["/gifts"], authMiddleware);

giftsRouter.get("/gifts", listGiftsController);
giftsRouter.post("/gifts", createGiftController);
giftsRouter.post("/gifts/files", rawFile, uploadGiftFileController);
giftsRouter.delete("/gifts/:id", deleteGiftController);
