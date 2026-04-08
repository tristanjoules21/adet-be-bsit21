import type { RowDataPacket } from "mysql2";

export interface PostModel extends RowDataPacket {
  post_id: number;
  title: string;
  description: string;
  status: "Active" | "Inactive";
  created_at: Date;
}

export interface CreatePost {
  title: string;
  description: string;
  status: "Active" | "Inactive";
}

export interface UpdatePost {
  title?: string;
  description?: string;
  status?: "Active" | "Inactive";
}