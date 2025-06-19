export interface DocumentHistoryModified {
  id: string;
  documentId: string;
  statusId: string;
  changedBy: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
