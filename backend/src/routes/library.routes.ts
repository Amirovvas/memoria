import express, { Router } from "express";
import {
  addFavoriteController,
  createProjectController,
  deletePhotoController,
  deleteProjectController,
  emptyTrashController,
  listFavoritesController,
  listPhotosController,
  listProjectsController,
  removeFavoriteController,
  updateProjectController,
  uploadPhotoController,
} from "../controllers/library.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

/** The signed-in user's own data: collages, favourite templates and uploaded photos. */
export const libraryRouter = Router();

libraryRouter.use(["/projects", "/favorites", "/photos"], authMiddleware);

libraryRouter.get("/projects", listProjectsController);
libraryRouter.delete("/projects", emptyTrashController);
libraryRouter.put("/projects/:id", createProjectController);
libraryRouter.patch("/projects/:id", updateProjectController);
libraryRouter.delete("/projects/:id", deleteProjectController);

libraryRouter.get("/favorites", listFavoritesController);
libraryRouter.put("/favorites/:id", addFavoriteController);
libraryRouter.delete("/favorites/:id", removeFavoriteController);

libraryRouter.get("/photos", listPhotosController);
libraryRouter.post("/photos", express.raw({ type: "image/*", limit: "10mb" }), uploadPhotoController);
libraryRouter.delete("/photos/:id", deletePhotoController);
