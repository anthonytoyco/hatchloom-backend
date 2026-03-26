export type ClassifiedPost = {
  id: number;
  title: string;
  content: string;
  author: string;
  projectId: string;
  positionId: string | null;
  assignedTo: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ClassifiedStatus = "open" | "filled" | "closed";
