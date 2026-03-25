import type { FeedPostApiItem, BackendPost } from "../types/post";

function normalizePost(item: FeedPostApiItem): BackendPost {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    author: item.author,
    postType: item.postType,
    createdAt: item.createdAt,
    likes: item.likeCount ?? 0,
    commentCount: item.commentCount ?? 0,
    isLikedByCurrentUser: item.likedByCurrentUser ?? false,
    comments: item.comments ?? [],
  };
}

export default normalizePost;
