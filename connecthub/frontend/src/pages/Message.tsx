import { useEffect, useMemo, useState } from "react";
import type {
  ConversationMessage,
  ConversationSummary,
} from "../types/conversation";
import { formatDateTime } from "../utils/dateUtils";
import getCurrentUserId from "../utils/user";
import apiClient from "../api/client";
import type { SendMessageResponse } from "../types/message";

function Message() {
  const currentUserId = getCurrentUserId();

  const [recipientUUIDInput, setRecipientUUIDInput] = useState<string>("");
  const [startMessageInput, setStartMessageInput] = useState<string>("");
  const [conversationMessageInput, setConversationMessageInput] =
    useState<string>("");

  const [isStartingConversation, setIsStartingConversation] =
    useState<boolean>(false);
  const [startConversationError, setStartConversationError] = useState<
    string | null
  >(null);

  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [sendMessageError, setSendMessageError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await apiClient.get("/api/message/conversation/");

        console.log(response);
        if (response.status === 200) {
          setConversations(response.data);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [currentUserId]);

  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMessages = async () => {
      try {
        const response = await apiClient.get(
          `/api/message/conversation/${activeConversationId}`,
        );

        console.log(response);
        if (response.status === 200) {
          const fetchedMessages = response.data;
          setMessages(fetchedMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [activeConversationId]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );

  const activeMessages = useMemo(
    () =>
      messages
        .filter((m) => m.conversationId === activeConversationId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [activeConversationId, messages],
  );

  const handleStartConversation = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setStartConversationError(null);

    const recipientId = recipientUUIDInput.trim();
    const messageText = startMessageInput.trim();

    if (!recipientId) {
      setStartConversationError("Recipient UUID is required.");
      return;
    }

    if (!messageText) {
      setStartConversationError("Message text cannot be empty.");
      return;
    }

    if (recipientId === currentUserId) {
      setStartConversationError(
        "You cannot start a conversation with yourself.",
      );
      return;
    }

    try {
      setIsStartingConversation(true);

      const response = await apiClient.post<SendMessageResponse>(
        `/api/message/${recipientId}/send`,
        {
          conversationId: null,
          content: messageText,
        },
      );

      if (response.status === 201) {
        const data = response.data;

        setConversations((prev) => {
          const existing = prev.find((c) => c.id === data.conversationId);
          if (existing) return prev;

          const newConversation: ConversationSummary = {
            id: data.conversationId,
            otherUserId: recipientId,
            createdAt: data.createdAt,
          };

          return [newConversation, ...prev];
        });

        setMessages((prev) => [
          ...prev,
          {
            id: data.messageId,
            conversationId: data.conversationId,
            senderId: data.senderId,
            content: data.content,
            createdAt: data.createdAt,
          },
        ]);

        setActiveConversationId(data.conversationId);
        setRecipientUUIDInput("");
        setStartMessageInput("");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      setStartConversationError(
        "Failed to start conversation. Please try again.",
      );
    } finally {
      setIsStartingConversation(false);
    }
  };

  const handleSendToActiveConversation = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setSendMessageError(null);

    if (!activeConversation) return;

    const trimmedMessage = conversationMessageInput.trim();
    if (!trimmedMessage) {
      setSendMessageError("Message text cannot be empty.");
      return;
    }

    try {
      setIsSendingMessage(true);

      const response = await apiClient.post<SendMessageResponse>(
        `/api/message/${activeConversation.otherUserId}/send`,
        {
          conversationId: activeConversation.id,
          content: trimmedMessage,
        },
      );

      if (response.status === 201) {
        const data = response.data;

        setMessages((prev) => [
          ...prev,
          {
            id: data.messageId,
            conversationId: data.conversationId,
            senderId: data.senderId,
            content: data.content,
            createdAt: data.createdAt,
          },
        ]);

        setConversationMessageInput("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSendMessageError("Failed to send message. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm font-semibold text-gray-600">
          Loading conversations...
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-charcoal text-2xl font-extrabold">
          Messages
        </h1>
        <p className="text-text-soft mt-1 text-sm font-semibold">
          View all conversations for your account and open one to see message
          history.
        </p>
      </div>

      <div className="grid min-h-[65vh] grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
        <aside className="bg-card border-border overflow-hidden rounded-2xl border-[1.5px]">
          <div className="border-border border-b px-4 py-3">
            <h2 className="font-display text-charcoal text-sm font-extrabold uppercase">
              Conversations ({conversations.length})
            </h2>
          </div>

          <div className="border-border border-b p-3">
            <p className="text-charcoal mb-2 text-xs font-extrabold uppercase">
              Start Conversation
            </p>

            <form onSubmit={handleStartConversation} className="space-y-2">
              <input
                type="text"
                value={recipientUUIDInput}
                onChange={(e) => setRecipientUUIDInput(e.target.value)}
                placeholder="Recipient UUID"
                className="border-border text-charcoal w-full rounded-lg border bg-white px-2.5 py-2 text-xs outline-none"
              />
              <input
                type="text"
                value={startMessageInput}
                onChange={(e) => setStartMessageInput(e.target.value)}
                placeholder="First message"
                className="border-border text-charcoal w-full rounded-lg border bg-white px-2.5 py-2 text-xs outline-none"
              />
              {startConversationError && (
                <p className="text-xs font-semibold text-red-600">
                  {startConversationError}
                </p>
              )}
              <button
                type="submit"
                disabled={isStartingConversation}
                className="font-display w-full cursor-pointer rounded-lg bg-black px-3 py-2 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStartingConversation ? "Starting..." : "Start"}
              </button>
            </form>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-text-soft p-4 text-sm font-semibold">
                No conversations yet.
              </p>
            ) : (
              conversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={`w-full cursor-pointer border-b border-gray-100 px-4 py-3 text-left transition-colors ${
                      isActive ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-charcoal truncate text-sm font-bold">
                      {conversation.otherUserId}
                    </p>
                    <p className="text-text-soft mt-1 text-xs font-semibold">
                      Started: {formatDateTime(conversation.createdAt)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="bg-card border-border flex min-h-[65vh] flex-col rounded-2xl border-[1.5px]">
          <div className="border-border border-b px-4 py-3">
            {activeConversation ? (
              <>
                <h2 className="text-charcoal text-sm font-extrabold">
                  Conversation with {activeConversation.otherUserId}
                </h2>
                <p className="text-text-soft mt-0.5 text-xs font-semibold">
                  Created: {formatDateTime(activeConversation.createdAt)}
                </p>
              </>
            ) : (
              <h2 className="text-charcoal text-sm font-extrabold">
                Select a conversation
              </h2>
            )}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {!activeConversation ? (
              <p className="text-text-soft text-sm font-semibold">
                Pick a conversation from the left panel to view its messages.
              </p>
            ) : activeMessages.length === 0 ? (
              <p className="text-text-soft text-sm font-semibold">
                No messages in this conversation yet.
              </p>
            ) : (
              activeMessages.map((message) => {
                const mine = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                        mine
                          ? "bg-black text-white"
                          : "border border-gray-200 bg-gray-50 text-gray-900"
                      }`}
                    >
                      <p className="text-[0.82rem] leading-relaxed font-semibold">
                        {message.content}
                      </p>
                      <p
                        className={`mt-1 text-[0.66rem] font-semibold ${
                          mine ? "text-gray-200" : "text-gray-500"
                        }`}
                      >
                        {formatDateTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {activeConversation && (
            <div className="border-border border-t p-4">
              <form
                onSubmit={handleSendToActiveConversation}
                className="space-y-2"
              >
                <input
                  type="text"
                  value={conversationMessageInput}
                  onChange={(e) => setConversationMessageInput(e.target.value)}
                  placeholder="Type a message"
                  className="border-border text-charcoal w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
                  disabled={isSendingMessage}
                />
                {sendMessageError && (
                  <p className="text-xs font-semibold text-red-600">
                    {sendMessageError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSendingMessage}
                  className="font-display cursor-pointer rounded-lg bg-black px-4 py-2 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSendingMessage ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

export default Message;
