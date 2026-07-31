import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  serializeTimestamp,
} from "../firestore";
import { Post, PostSerialized } from "@/types/post";

const POSTS_COLLECTION = "posts";

export function serializePost(post: Post): PostSerialized {
  return {
    ...post,
    publishedAt: post.publishedAt ? serializeTimestamp(post.publishedAt) : undefined,
    createdAt: serializeTimestamp(post.createdAt),
    updatedAt: serializeTimestamp(post.updatedAt),
  };
}

export interface GetPostsOptions {
  categoryId?: string;
  status?: "draft" | "published";
  limitCount?: number;
}

export async function getPosts(options: GetPostsOptions = {}): Promise<PostSerialized[]> {
  try {
    const { categoryId, status = "published", limitCount = 20 } = options;
    const constraints = [];

    if (status) {
      constraints.push(where("status", "==", status));
    }
    if (categoryId) {
      constraints.push(where("categoryId", "==", categoryId));
    }

    const q = query(collection(db, POSTS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    const posts = snapshot.docs.map((docSnap) => {
      const post: Post = {
        id: docSnap.id,
        ...docSnap.data(),
      } as Post;
      return serializePost(post);
    });

    posts.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });

    if (limitCount > 0) {
      return posts.slice(0, limitCount);
    }

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<PostSerialized | null> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where("slug", "==", slug),
      where("status", "==", "published"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const post: Post = {
      id: docSnap.id,
      ...docSnap.data(),
    } as Post;
    return serializePost(post);
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
}

export async function getPostById(id: string): Promise<PostSerialized | null> {
  try {
    const docRef = doc(db, POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const post: Post = {
      id: docSnap.id,
      ...docSnap.data(),
    } as Post;
    return serializePost(post);
  } catch (error) {
    console.error("Error fetching post by id:", error);
    return null;
  }
}

function cleanData<T extends Record<string, any>>(obj: T): T {
  const cleaned = { ...obj };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
}

export async function createPost(
  data: Omit<Post, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const cleanedData = cleanData(data);
  const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
    ...cleanedData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: data.status === "published" ? serverTimestamp() : null,
  });
  return docRef.id;
}

export async function updatePost(
  id: string,
  data: Partial<Omit<Post, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const cleanedData = cleanData(data);
  const docRef = doc(db, POSTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...cleanedData,
    updatedAt: serverTimestamp(),
    ...(data.status === "published" ? { publishedAt: serverTimestamp() } : {}),
  });
}

export async function deletePost(id: string): Promise<void> {
  const docRef = doc(db, POSTS_COLLECTION, id);
  await deleteDoc(docRef);
}
