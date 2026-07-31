import { Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  email: string;
  displayName?: string;

  role: "admin" | "editor" | "viewer";

  status: "active" | "inactive";

  createdAt: Timestamp;
}

export interface UserSerialized {
  id: string;
  email: string;
  displayName?: string;

  role: "admin" | "editor" | "viewer";

  status: "active" | "inactive";

  createdAt: string;
}
