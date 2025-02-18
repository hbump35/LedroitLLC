import { 
  users, communities, posts, communityMembers,
  type User, type InsertUser,
  type Community, type Post
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCommunity(id: number): Promise<Community | undefined>;
  listCommunities(query?: string): Promise<Community[]>;
  createCommunity(community: Omit<Community, "id" | "createdAt">): Promise<Community>;

  getPost(id: number): Promise<Post | undefined>;
  listPosts(communityId: number): Promise<Post[]>;
  createPost(post: Omit<Post, "id" | "createdAt">): Promise<Post>;

  joinCommunity(userId: number, communityId: number): Promise<void>;
  leaveCommunity(userId: number, communityId: number): Promise<void>;
  isMember(userId: number, communityId: number): Promise<boolean>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCommunity(id: number): Promise<Community | undefined> {
    const [community] = await db.select().from(communities).where(eq(communities.id, id));
    return community;
  }

  async listCommunities(query?: string): Promise<Community[]> {
    let communitiesQuery = db.select().from(communities);

    if (query) {
      communitiesQuery = communitiesQuery.where(
        or(
          ilike(communities.name, `%${query}%`),
          ilike(communities.description, `%${query}%`)
        )
      );
    }

    return await communitiesQuery;
  }

  async createCommunity(community: Omit<Community, "id" | "createdAt">): Promise<Community> {
    const [newCommunity] = await db
      .insert(communities)
      .values({ ...community, createdAt: new Date() })
      .returning();
    return newCommunity;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async listPosts(communityId: number): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.communityId, communityId));
  }

  async createPost(post: Omit<Post, "id" | "createdAt">): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values({ ...post, createdAt: new Date() })
      .returning();
    return newPost;
  }

  async joinCommunity(userId: number, communityId: number): Promise<void> {
    await db.insert(communityMembers).values({ userId, communityId });
  }

  async leaveCommunity(userId: number, communityId: number): Promise<void> {
    await db
      .delete(communityMembers)
      .where(
        and(
          eq(communityMembers.userId, userId),
          eq(communityMembers.communityId, communityId)
        )
      );
  }

  async isMember(userId: number, communityId: number): Promise<boolean> {
    const [membership] = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.userId, userId),
          eq(communityMembers.communityId, communityId)
        )
      );
    return !!membership;
  }
}

export const storage = new DatabaseStorage();