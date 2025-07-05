import { Friend } from "../friend/friend.model";
import { Pet } from "../pet/pet.model";
import { Post } from "../post/post.model";
import { Comment } from "../folderComments/comment.model";

export interface Profile {
  uid: string
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  photoURL?: string;
  pets?: Pet[];
  posts?: Post[];
  friends?: Friend[];
  comments?: Comment[]
}