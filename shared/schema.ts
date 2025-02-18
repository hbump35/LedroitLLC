import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  location: text("location"),
  latitude: text("latitude"),
  longitude: text("longitude"),
});

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail").notNull(),
  isLocal: boolean("is_local").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  creatorId: integer("creator_id").notNull(),
});

export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  communityId: integer("community_id").notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  communityId: integer("community_id").notNull(),
  authorId: integer("author_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  location: true,
  latitude: true,
  longitude: true,
});

export const insertCommunitySchema = createInsertSchema(communities).pick({
  name: true,
  description: true,
  thumbnail: true,
  isLocal: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  content: true,
  communityId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Community = typeof communities.$inferSelect;
export type Post = typeof posts.$inferSelect;
