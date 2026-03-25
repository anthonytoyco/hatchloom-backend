export type BackendPost = {
  id: number;
  title: string;
  content: string;
  author: string;
  postType: string;
  createdAt: string;
  likes: number;
  commentCount: number;
  comments?: PostComment[];
  isLikedByCurrentUser?: boolean;
};

export type PostComment = {
  id: number;
  userId: string;
  postId: number;
  commentText: string;
  createdAt: string;
};

export type FeedPostApiItem = {
  id: number;
  title: string;
  content: string;
  author: string;
  postType: string;
  createdAt: string;
  likeCount?: number;
  commentCount?: number;
  likedByCurrentUser?: boolean;
  comments?: PostComment[];
};

export type CursorResponse<T> = {
  data: T[];
  nextCursor: string | null;
  hasNext: boolean;
};

export type CreatePostType = "share" | "announcement" | "achievement";
