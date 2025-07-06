import { Comment } from "../folderComments/comment.model";
export interface Post {
  timestamp: string;
  content: string;
  photoURL?: string;
  id: string;
  username?: string;
  userAvatar?: string;
  pet_id?: string;
  petName?: string;
  comments: Comment[];
  likes?: { uid: string; username: string }[];
  likesCount?: number;
}
