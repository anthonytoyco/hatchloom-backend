import Post from "../components/Post";
import type {
  BackendPost,
  FeedPostApiItem,
  CursorResponse,
  CreatePostType,
} from "../types/post";
import { useState, useEffect, useRef, useCallback } from "react";
import apiClient from "../api/client";
import { Link } from "react-router-dom";
import normalizePost from "../utils/normalizePost";

const POSTS_PER_PAGE = 10;

function Feed() {
  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    title: string;
    content: string;
    postType: CreatePostType;
  }>({
    title: "",
    content: "",
    postType: "share",
  });

  const isLoadingRef = useRef(false);

  const fetchPosts = useCallback(async (cursor: string | null = null) => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setError(null);

    try {
      const response = await apiClient.get<CursorResponse<FeedPostApiItem>>(
        "/api/feed",
        {
          params: { limit: POSTS_PER_PAGE, after: cursor },
        },
      );

      console.log(response.data);

      if (response.status === 200) {
        const incoming = (response.data.data ?? []).map(normalizePost);
        const newCursor = response.data.nextCursor;
        const hasMore = response.data.hasNext;

        setPosts((prev) => (cursor ? [...prev, ...incoming] : incoming));
        setNextCursor(newCursor);
        setHasNext(hasMore);
      }
    } catch (err) {
      setError("Failed to load posts. Please try again.");
      console.log("Error fetching posts:", err);
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPosts(null);
  }, [fetchPosts]);

  useEffect(() => {
    if (!loaderRef.current || !hasNext) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoadingRef.current) {
        fetchPosts(nextCursor);
      }
    });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchPosts, hasNext, nextCursor]);

  const openCreateModal = () => {
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    if (isCreating) return;
    setIsCreateOpen(false);
    setCreateError(null);
  };

  const onCreatePost = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content) {
      setCreateError("Title and content are required.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await apiClient.post("/api/feed", {
        basePost: {
          title,
          content,
        },
        postType: form.postType,
      });

      console.log("Create post response:", response);

      const newPost = normalizePost(response.data);
      setPosts((prev) => [newPost, ...prev]);
      setForm({
        title: "",
        content: "",
        postType: "share",
      });
      setIsCreateOpen(false);
    } catch (err) {
      setCreateError("Could not create post. Please try again.");
      console.log("Error creating post:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePost = useCallback((postId: number) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  }, []);

  return (
    <section className="mx-auto flex flex-col items-center px-4 py-8">
      <div className="mb-6 flex flex-col items-center justify-center gap-8">
        <h1 className="font-display text-charcoal text-2xl font-extrabold">
          Latest Posts
        </h1>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={openCreateModal}
            className="font-display cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-sm font-extrabold text-red-700 transition-colors hover:bg-red-200"
          >
            Create Post
          </button>
          <Link
            to="/messages"
            className="font-display text-teal cursor-pointer rounded-lg border border-blue-200 px-4 py-2 text-sm font-extrabold transition-colors hover:bg-blue-200"
          >
            View Messages
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 w-full max-w-3xl rounded-lg border bg-black px-4 py-3 text-sm font-semibold text-white">
          {error}
        </div>
      )}
      <div className="flex flex-col items-center space-y-6">
        {posts.map((post: BackendPost) => (
          <Post key={post.id} post={post} onDelete={handleDeletePost} />
        ))}
      </div>
      <div ref={loaderRef} className="h-10" />
      {isCreateOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/45 px-4">
          <div className="bg-card border-border w-full max-w-xl rounded-2xl border-[1.5px] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="font-display text-charcoal text-lg font-extrabold">
                Create a Post
              </h2>
              <button
                type="button"
                onClick={closeCreateModal}
                className="font-display text-text-soft cursor-pointer rounded-md px-2 py-1 text-sm font-extrabold hover:bg-gray-100 hover:text-black"
              >
                X
              </button>
            </div>
            <form onSubmit={onCreatePost} className="space-y-4">
              <div>
                <label className="font-display text-text-soft mb-1 block text-xs font-extrabold uppercase">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Give your post a title"
                  className="border-border text-charcoal w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="font-display text-text-soft mb-1 block text-xs font-extrabold uppercase">
                  Content
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, content: e.target.value }))
                  }
                  rows={5}
                  placeholder="Write your post content..."
                  className="border-border text-charcoal w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="font-display text-text-soft mb-1 block text-xs font-extrabold uppercase">
                  Post Type
                </label>
                <select
                  value={form.postType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      postType: e.target.value as CreatePostType,
                    }))
                  }
                  className="border-border text-charcoal w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                >
                  <option value="share">Share</option>
                  <option value="announcement">Announcement</option>
                  <option value="achievement">Achievement</option>
                </select>
              </div>
              {createError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {createError}
                </div>
              )}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={isCreating}
                  className="font-display cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-extrabold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="font-display cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating ? "Creating..." : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Feed;
