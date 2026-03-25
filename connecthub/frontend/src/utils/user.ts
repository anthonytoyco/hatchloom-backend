function getCurrentUserId(): string {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const userId = JSON.parse(raw).userId;
    return userId;
  } catch {
    return "current-user";
  }
}

export default getCurrentUserId;
