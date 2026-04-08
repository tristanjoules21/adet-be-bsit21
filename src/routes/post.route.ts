import { Hono } from "hono";

import {
  getAllPosts,
  getPostById,
  createPost,
  updatePostById,
  deletePostById
} from "../controllers/post.controller.js";

const postRoutes = new Hono();

postRoutes.get("/posts", getAllPosts);
postRoutes.get("/posts/:id", getPostById);
postRoutes.post("/posts", createPost);
postRoutes.patch("/posts/:id", updatePostById);
postRoutes.delete("/posts/:id", deletePostById);

export default postRoutes;