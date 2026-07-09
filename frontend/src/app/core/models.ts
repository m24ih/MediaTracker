export interface User {
  id: string;
  username: string;
}

export interface Media {
  id: string;
  title: string;
  externalId: string;
  type: string;
}

/**
 * Represents a single comment node in a PostgreSQL LTree-backed hierarchy.
 * The `path` field (e.g. "root.abc123.def456") is used client-side by
 * CommentService.buildTree() to reconstruct the parent-child relationship.
 * The `children` array is populated at runtime — it does NOT come from the API.
 */
export interface CommentNode {
  id: string;
  content: string;
  path: string;       // LTree path, e.g. "root.abc123" or "root.abc123.def456"
  createdAt?: string;
  user: User;
  children?: CommentNode[];
}
