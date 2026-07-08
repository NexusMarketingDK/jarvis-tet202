export type MemoryCategory =
  | 'identity'
  | 'preference'
  | 'project'
  | 'workflow'
  | 'favorite'
  | 'fact';

export interface Memory {
  id: string;
  userId: string;
  category: MemoryCategory;
  key: string;
  value: string;
  importance: number; // 1-5, used for ranking when building the prompt context
  createdAt: string;
  updatedAt: string;
}
