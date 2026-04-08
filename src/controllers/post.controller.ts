import type { Context } from "hono";
import type { ResultSetHeader } from "mysql2";
import pool from "../config/db.js";
import type { CreatePost, PostModel, UpdatePost } from "../models/post.model.js";

export async function getAllPosts(context: Context) {
  try {
    const [rows] = await pool.query<PostModel[]>("SELECT * FROM posts");
    return context.json(rows, 200);
  } catch (error) {
    console.log(error);
    return context.json({ message: "Error fetching posts" }, 500);
  }
}

export async function getPostById(context: Context) {
  try {
    const postId = context.req.param("id");

    const [rows] = await pool.query<PostModel[]>(
      "SELECT * FROM posts WHERE post_id = ?",
      [postId]
    );

    const data = rows[0];

    if (data) {
      return context.json(data, 200);
    }

    return context.json({ message: "Post not found" }, 404);
  } catch (error) {
    console.log(error);
    return context.json({ message: "Internal server error" }, 500);
  }
}

export async function createPost(context: Context) {
  try {
    const body: CreatePost | CreatePost[] = await context.req.json();

    const posts = Array.isArray(body) ? body : [body];

    for (const post of posts) {
      if (!post.title || !post.description || !post.status) {
        return context.json({ message: "Missing required fields" }, 400);
      }
    }

    const createdPosts = [];

    for (const post of posts) {
      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO posts (title, description, status) VALUES (?, ?, ?)",
        [post.title, post.description, post.status]
      );

      if (result) {
        const postId = result.insertId;

        const [data] = await pool.query<PostModel[]>(
          "SELECT * FROM posts WHERE post_id = ?",
          [postId]
        );

        createdPosts.push(data[0]);
      }
    }

    return context.json(createdPosts, 201);
  } catch (error) {
    console.log(error);
    return context.json({ message: "Error creating post" }, 500);
  }
}

export async function deletePostById(context: Context) {
  try {
    const postId = context.req.param("id");

    await pool.query<ResultSetHeader>(
      "DELETE FROM posts WHERE post_id = ?",
      [postId]
    );

    return context.json({ message: "Post deleted successfully" }, 200);
  } catch (error) {
    console.log(error);
    return context.json({ message: "Error deleting post" }, 500);
  }
}

export async function updatePostById(context: Context) {
  try {
    const postId = context.req.param("id");
    const body: UpdatePost = await context.req.json();

    const [existingRows] = await pool.query<PostModel[]>(
      "SELECT * FROM posts WHERE post_id = ?",
      [postId]
    );

    if (!existingRows || existingRows.length === 0) {
      return context.json({ message: "Post not found" }, 404);
    }

    const existing = existingRows[0];

    if (!body.title && !body.description && !body.status) {
      return context.json(
        { message: "Provide at least one field to update" },
        400
      );
    }

    const updatedPost: UpdatePost = {
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      status: body.status ?? existing.status,
    };

    if (
      updatedPost.status &&
      updatedPost.status !== "Active" &&
      updatedPost.status !== "Inactive"
    ) {
      return context.json(
        { message: "status must be 'Active' or 'Inactive'" },
        400
      );
    }

    await pool.query(
      "UPDATE posts SET title = ?, description = ?, status = ? WHERE post_id = ?",
      [
        updatedPost.title,
        updatedPost.description,
        updatedPost.status,
        postId,
      ]
    );

    const [data] = await pool.query<PostModel[]>(
      "SELECT * FROM posts WHERE post_id = ?",
      [postId]
    );

    return context.json(data[0], 200);
  } catch (error) {
    console.log(error);
    return context.json({ message: "Error updating post" }, 500);
  }
}