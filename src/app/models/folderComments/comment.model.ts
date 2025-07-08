// src/app/services/comment/comment.service.ts
export interface Comment {
  photoURL: string;
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;

}

export interface AddCommentResponse {
  mensaje: string;
  id: string;
}

export interface CommentsResponse {
  comments: Comment[];
}
