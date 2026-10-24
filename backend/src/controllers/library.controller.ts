import { NextFunction, Request, Response } from "express";
import { addFavorite, listFavorites, removeFavorite } from "../services/favorites.service";
import { deletePhoto, listPhotos, savePhoto } from "../services/photos.service";
import {
  createProject,
  deleteProject,
  emptyTrash,
  listProjects,
  updateProject,
} from "../services/projects.service";

type Handler = (req: Request<{ id: string }>, res: Response) => Promise<void>;

/** Every route here sits behind authMiddleware, so `req.user` is always set. */
const handle =
  (fn: Handler) =>
  (req: Request<{ id: string }>, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

/* ---------- projects ---------- */

export const listProjectsController = handle(async (req, res) => {
  res.status(200).json({ data: await listProjects(req.user!.id) });
});

export const createProjectController = handle(async (req, res) => {
  res.status(201).json({ data: await createProject(req.user!.id, req.params.id, req.body ?? {}) });
});

export const updateProjectController = handle(async (req, res) => {
  res.status(200).json({ data: await updateProject(req.user!.id, req.params.id, req.body ?? {}) });
});

export const deleteProjectController = handle(async (req, res) => {
  await deleteProject(req.user!.id, req.params.id);
  res.status(204).end();
});

export const emptyTrashController = handle(async (req, res) => {
  await emptyTrash(req.user!.id);
  res.status(204).end();
});

/* ---------- favorites ---------- */

export const listFavoritesController = handle(async (req, res) => {
  res.status(200).json({ data: await listFavorites(req.user!.id) });
});

export const addFavoriteController = handle(async (req, res) => {
  await addFavorite(req.user!.id, req.params.id);
  res.status(204).end();
});

export const removeFavoriteController = handle(async (req, res) => {
  await removeFavorite(req.user!.id, req.params.id);
  res.status(204).end();
});

/* ---------- photos ---------- */

export const listPhotosController = handle(async (req, res) => {
  res.status(200).json({ data: await listPhotos(req.user!.id) });
});

/** The body is the image itself (express.raw), the file name comes in ?name=. */
export const uploadPhotoController = handle(async (req, res) => {
  res.status(201).json({ data: await savePhoto(req.user!.id, req.body, req.headers["content-type"], req.query.name) });
});

export const deletePhotoController = handle(async (req, res) => {
  await deletePhoto(req.user!.id, req.params.id);
  res.status(204).end();
});
