import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "../api/client";
import type { ClassifiedPost, ClassifiedStatus } from "../types/classified";
import type { CursorResponse } from "../types/post";

const POSTS_PER_PAGE = 20;

const STATUS_STYLE: Record<string, string> = {
  open: "border-green-200 bg-green-50 text-green-700",
  filled: "border-amber-200 bg-amber-50 text-amber-600",
  closed: "border-gray-200 bg-gray-50 text-gray-500",
};

function ClassifiedCard({
  post,
  onApply,
}: {
  post: ClassifiedPost;
  onApply: (id: number) => void;
}) {
  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="border-border bg-card w-full rounded-2xl border-[1.5px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="font-display text-charcoal text-[0.9rem] font-extrabold leading-snug">
          {post.title}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 font-display text-[0.65rem] font-extrabold uppercase ${
            STATUS_STYLE[post.status] ?? STATUS_STYLE.open
          }`}
        >
          {post.status}
        </span>
      </div>
      <p className="text-text mb-3 text-[0.78rem] leading-relaxed">
        {post.content}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-text-soft text-[0.65rem] font-semibold">
          {date}
          {post.positionId && (
            <span className="bg-teal-light text-teal border-teal-border ml-2 rounded-[99px] border-[1px] px-2 py-0.5 text-[0.6rem] font-bold">
              Linked Position
            </span>
          )}
        </span>
        {post.status === "open" && (
          <button
            type="button"
            onClick={() => onApply(post.id)}
            className="font-display cursor-pointer rounded-lg border border-blue-200 px-3 py-1 text-[0.72rem] font-extrabold text-blue-700 transition-colors hover:bg-blue-50"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  );
}

function Classifieds() {
  const [searchParams] = useSearchParams();
  const prefilledPositionId = searchParams.get("positionId") ?? "";
  const prefilledProjectId = searchParams.get("projectId") ?? "";

  const [posts, setPosts] = useState<ClassifiedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [statusFilter, setStatusFilter] = useState<ClassifiedStatus>("open");

  const [isCreateOpen, setIsCreateOpen] = useState(
    () => !!prefilledPositionId || !!prefilledProjectId,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    projectId: prefilledProjectId,
    positionId: prefilledPositionId,
    status: "open" as ClassifiedStatus,
  });

  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  const fetchPosts = useCallback(
    async (cursor: string | null = null, status: ClassifiedStatus = "open") => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setLoadError(null);

      try {
        const response = await apiClient.get<CursorResponse<ClassifiedPost>>(
          "/api/classified",
          {
            params: { limit: POSTS_PER_PAGE, after: cursor, statusType: status },
          },
        );

        if (response.status === 200) {
          const incoming = response.data.data ?? [];
          setPosts((prev) => (cursor ? [...prev, ...incoming] : incoming));
          setNextCursor(response.data.nextCursor);
          setHasNext(response.data.hasNext);
        }
      } catch {
        setLoadError("Failed to load classifieds. Please try again.");
      } finally {
        isLoadingRef.current = false;
      }
    },
    [],
  );

  useEffect(() => {
    setPosts([]);
    setNextCursor(null);
    fetchPosts(null, statusFilter);
  }, [fetchPosts, statusFilter]);

  useEffect(() => {
    if (!loaderRef.current || !hasNext) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoadingRef.current) {
        fetchPosts(nextCursor, statusFilter);
      }
    });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchPosts, hasNext, nextCursor, statusFilter]);

  const openCreate = () => {
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    if (isCreating) return;
    setIsCreateOpen(false);
    setCreateError(null);
  };

  const onSubmitCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = form.title.trim();
    const content = form.content.trim();
    const projectId = form.projectId.trim();

    if (!title || !content || !projectId) {
      setCreateError("Title, content, and project ID are required.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const body: Record<string, unknown> = {
        basePost: { title, content },
        projectId,
        status: form.status,
      };
      if (form.positionId.trim()) {
        body.positionId = form.positionId.trim();
      }

      const response = await apiClient.post<ClassifiedPost>(
        "/api/classified",
        body,
      );

      setPosts((prev) => [response.data, ...prev]);
      setForm({
        title: "",
        content: "",
        projectId: "",
        positionId: "",
        status: "open",
      });
      setIsCreateOpen(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Could not create classified post.";
      setCreateError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleApply = async (postId: number) => {
    setApplyError(null);
    setApplySuccess(null);
    try {
      await apiClient.post(`/api/classified/${postId}/apply`);
      setApplySuccess("Application submitted successfully.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Could not apply. Try again.";
      setApplyError(msg);
    }
  };

  return (
    <section className="mx-auto flex max-w-3xl flex-col px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-charcoal text-2xl font-extrabold">
            Classifieds
          </h1>
          <p className="text-text-soft mt-0.5 text-[0.8rem] font-semibold">
            Open positions from SideHustles across the platform
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="font-display cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-sm font-extrabold text-red-700 transition-colors hover:bg-red-50"
        >
          + Post Classified
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="mb-5 flex gap-2">
        {(["open", "filled", "closed"] as ClassifiedStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`font-display rounded-full border px-3 py-1 text-[0.72rem] font-extrabold capitalize transition-colors ${
              statusFilter === s
                ? "border-charcoal bg-charcoal text-white"
                : "border-border text-text-soft hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {applySuccess && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
          {applySuccess}
        </div>
      )}
      {applyError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
          {applyError}
        </div>
      )}
      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
          {loadError}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {posts.length === 0 && !isLoadingRef.current && (
          <p className="text-text-soft py-10 text-center text-sm font-semibold">
            No {statusFilter} classifieds found.
          </p>
        )}
        {posts.map((post) => (
          <ClassifiedCard key={post.id} post={post} onApply={handleApply} />
        ))}
      </div>
      <div ref={loaderRef} className="h-10" />

      {/* Create modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/45 px-4">
          <div className="bg-card border-border w-full max-w-xl rounded-2xl border-[1.5px] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="font-display text-charcoal text-lg font-extrabold">
                Post a Classified
              </h2>
              <button
                type="button"
                onClick={closeCreate}
                className="font-display text-text-soft cursor-pointer rounded-md px-2 py-1 text-sm font-extrabold hover:bg-gray-100 hover:text-black"
              >
                X
              </button>
            </div>

            <form onSubmit={(e) => void onSubmitCreate(e)} className="space-y-4">
              <div>
                <label className="font-display text-text-soft mb-1 block text-xs font-extrabold uppercase">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Seeking UI/UX Designer"
                  maxLength={255}
                  className="border-border text-charcoal w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="font-display text-text-soft mb-1 block text-xs font-extrabold uppercase">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, content: e.target.value }))
                  }
                  rows={4}
                  maxLength={3000}
                  placeholder="Describe the role, what you're looking for..."
                  className="border-border text-charcoal w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="font-display text-text-soft mb-1 block text-xs font-extrabold uppercase">
                  Project ID (SideHustle UUID){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.projectId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, projectId: e.target.value }))
                  }
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  readOnly={!!prefilledProjectId}
                  className={`border-border text-charcoal w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                    prefilledProjectId ? "bg-gray-50 text-gray-500" : "bg-white"
                  }`}
                />
              </div>

              <div>
                <label className="font-display text-text-soft mb-1 block text-xs font-extrabold uppercase">
                  Position ID{" "}
                  <span className="text-text-soft font-semibold normal-case">
                    (optional — links to LaunchPad position)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.positionId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, positionId: e.target.value }))
                  }
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  readOnly={!!prefilledPositionId}
                  className={`border-border text-charcoal w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                    prefilledPositionId ? "bg-gray-50 text-gray-500" : "bg-white"
                  }`}
                />
                {prefilledPositionId && (
                  <p className="mt-1 text-[0.68rem] font-semibold text-green-600">
                    Position pre-filled from LaunchPad. Only OPEN positions can be
                    posted.
                  </p>
                )}
              </div>

              <div>
                <label className="font-display text-text-soft mb-1 block text-xs font-extrabold uppercase">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as ClassifiedStatus,
                    }))
                  }
                  className="border-border text-charcoal w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                >
                  <option value="open">Open</option>
                  <option value="filled">Filled</option>
                  <option value="closed">Closed</option>
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
                  onClick={closeCreate}
                  disabled={isCreating}
                  className="font-display cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-extrabold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="font-display cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isCreating ? "Posting..." : "Post Classified"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Classifieds;
