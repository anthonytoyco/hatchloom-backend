import { useState } from "react";
import type { BackendPost, PostComment } from "../types/post";
import apiClient from "../api/client";
import { formatDateTime } from "../utils/dateUtils";
import getCurrentUserId from "../utils/user";

function getPostTypeBadgeClass(postType: string) {
  const lower = postType.toLowerCase();

  if (lower.includes("announcement")) {
    return "border-black bg-black text-white";
  }

  if (lower.includes("achievement")) {
    return "border-amber-300 bg-amber-100 text-amber-700";
  }

  if (lower.includes("share")) {
    return "border-green-200 bg-green-300 text-green-800";
  }

  return "border-red-200 bg-red-100 text-red-700";
}

function Post({
  post,
  onDelete,
}: {
  post: BackendPost;
  onDelete?: (postId: number) => void;
}) {
  const [liked, setLiked] = useState<boolean>(
    post.isLikedByCurrentUser ?? false,
  );
  const [likesCount, setLikesCount] = useState<number>(post.likes ?? 0);
  const [comments, setComments] = useState<PostComment[]>(post.comments ?? []);
  const [commentsCount, setCommentsCount] = useState<number>(
    post.commentCount ?? post.comments?.length ?? 0,
  );
  const [commentInput, setCommentInput] = useState<string>("");
  const userId = getCurrentUserId();

  const addLike = async () => {
    try {
      const response = await apiClient.post(`/api/feed/actions/like`, {
        postId: post.id,
      });

      console.log("Like response:", response.data);

      if (response.status === 201) {
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const removeLike = async () => {
    try {
      const response = await apiClient.delete(
        `/api/feed/actions/like?postId=${post.id}`,
      );

      console.log("Unlike response:", response.data);

      if (response.status === 200) {
        setLiked(false);
        setLikesCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };

  const deletePost = async () => {
    try {
      const response = await apiClient.delete(`/api/feed/${post.id}`);
      console.log("Delete response:", response.data);

      if (response.status === 200) {
        onDelete?.(post.id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const addComment = async () => {
    if (commentInput.trim() === "") return;

    try {
      const response = await apiClient.post(`/api/feed/actions/comment`, {
        postId: post.id,
        commentText: commentInput.trim(),
      });

      console.log(response);
      if (response.status === 201) {
        const newComment: PostComment = response.data;
        setComments((prev) => [...prev, newComment]);
        setCommentsCount((prev) => prev + 1);
        setCommentInput("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      const response = await apiClient.delete(
        `/api/feed/actions/comment/${commentId}`,
      );

      console.log(response);
      if (response.status === 200) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCommentsCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <article className="border-border bg-card w-40 rounded-2xl border-[1.5px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 sm:w-48 md:w-64 lg:w-90 xl:w-150">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-text-soft text-[0.7rem] font-extrabold uppercase">
            Post #{post.id}
          </p>
          <h3 className="font-display text-charcoal mt-1 text-[1.05rem] leading-tight font-extrabold">
            {post.title}
          </h3>
        </div>
        <div className="flex flex-col gap-3">
          <span
            className={`font-display shrink-0 rounded-[99px] border px-2.5 py-1 text-[0.60rem] font-extrabold uppercase ${getPostTypeBadgeClass(
              post.postType,
            )}`}
          >
            {post.postType.toUpperCase()}
          </span>
          <button
            className="font-display shrink-0 cursor-pointer rounded-[99px] border px-2.5 py-1 text-[0.60rem] font-extrabold uppercase"
            hidden={userId !== post.author}
            onClick={deletePost}
          >
            Delete
          </button>
        </div>
      </div>
      <p className="text-text mb-4 text-sm leading-relaxed">{post.content}</p>

      <div className="border-border flex items-center justify-between border-t pt-3">
        <div className="min-w-0">
          <p className="font-display text-text-soft text-[0.65rem] font-extrabold uppercase">
            Author
          </p>
          <p className="text-charcoal truncate text-xs font-semibold">
            {post.author.substring(0, 8)}...
          </p>
        </div>

        <div className="text-right">
          <p className="font-display text-text-soft text-[0.65rem] font-extrabold uppercase">
            Created
          </p>
          <p className="text-text text-xs font-semibold">
            {formatDateTime(post.createdAt)}
          </p>
        </div>
      </div>

      <div className="border-border mt-3 border-t pt-3">
        <div className="mb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={liked ? removeLike : addLike}
            className={`font-display cursor-pointer rounded-[99px] border px-3 py-1 text-xs font-extrabold transition-colors ${
              liked
                ? "border-red-200 bg-red-100 text-red-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {liked ? "♥" : "♡"}
          </button>

          <span className="text-charcoal text-xs font-semibold">
            {likesCount} likes
          </span>
          <span className="text-text-soft ml-auto text-xs font-semibold">
            {commentsCount} comments
          </span>
        </div>

        <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2.5">
          {comments.length === 0 ? (
            <p className="text-text-soft text-xs font-semibold">
              No comments yet.
            </p>
          ) : (
            comments.map((comment: PostComment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2"
              >
                <p className="text-charcoal mb-1 text-xs">{comment.userId}</p>
                <p className="text-charcoal text-xs leading-relaxed font-semibold">
                  {comment.commentText}
                </p>
                <div className="flex justify-between">
                  <p className="text-text-soft mt-1 text-[0.65rem] font-semibold">
                    {formatDateTime(comment.createdAt)}
                  </p>
                  <button
                    hidden={userId !== comment.userId && userId !== post.author}
                    onClick={() => deleteComment(comment.id)}
                    className="font-display mt-1 cursor-pointer text-[0.6rem] font-extrabold text-red-600 uppercase hover:text-red-800 disabled:cursor-not-allowed disabled:text-red-300"
                  >
                    X
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={commentInput}
            onChange={(event) => setCommentInput(event.target.value)}
            placeholder="Add a comment..."
            className="border-border bg-bg text-charcoal flex-1 rounded-lg border px-3 py-2 text-xs outline-none"
          />
          <button
            type="button"
            onClick={addComment}
            className="font-display cursor-pointer rounded-lg bg-black px-3 py-2 text-xs font-extrabold text-white transition-opacity hover:opacity-85"
          >
            Post
          </button>
        </div>
      </div>
    </article>
  );
}

export default Post;
