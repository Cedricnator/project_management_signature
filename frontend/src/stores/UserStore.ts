import { AccountRole, DocumentStatus, type Account, type DocumentHistory } from '@/types'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        documentHistory: [] as DocumentHistory[],
    }),
    actions: {
        async getUserDocumentsHistoryByUserId(userId: string) {
            this.documentHistory = mockDocumentHistory().sort(
                (a, b) => b.createdAt.getDate() - a.createdAt.getDate(),
            )
        },
    },
    persist: true,
})

function mockDocumentHistory() {
    const mockDocumentHistory: DocumentHistory[] = [
        {
            documentHistoryId: 'dh-001',
            documentId: 'd-001',
            changedBy: 'user-001',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-01T10:00:00Z'),
            commentary: 'Initial validation successful.',
        },
        {
            documentHistoryId: 'dh-002',
            documentId: 'd-001',
            changedBy: 'user-002',
            action: DocumentStatus.invalid,
            createdAt: new Date('2025-06-02T12:00:00Z'),
            commentary: 'Missing signature.',
        },
        {
            documentHistoryId: 'dh-003',
            documentId: 'd-002',
            changedBy: 'user-001',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-03T14:00:00Z'),
            commentary: 'Approved by manager.',
        },
        {
            documentHistoryId: 'dh-004',
            documentId: 'd-002',
            changedBy: 'user-003',
            action: DocumentStatus.invalid,
            createdAt: new Date('2025-06-03T15:00:00Z'),
            commentary: 'Wrong document format.',
        },
        {
            documentHistoryId: 'dh-005',
            documentId: 'd-003',
            changedBy: 'user-001',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-04T09:00:00Z'),
        },
        {
            documentHistoryId: 'dh-006',
            documentId: 'd-004',
            changedBy: 'user-001',
            action: DocumentStatus.invalid,
            createdAt: new Date('2025-06-04T11:00:00Z'),
            commentary: 'Document expired.',
        },
        {
            documentHistoryId: 'dh-007',
            documentId: 'd-005',
            changedBy: 'user-002',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-05T08:30:00Z'),
        },
        {
            documentHistoryId: 'dh-008',
            documentId: 'd-006',
            changedBy: 'user-002',
            action: DocumentStatus.invalid,
            createdAt: new Date('2025-06-05T09:45:00Z'),
            commentary: 'Illegible scan.',
        },
        {
            documentHistoryId: 'dh-009',
            documentId: 'd-007',
            changedBy: 'user-001',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-06T10:00:00Z'),
        },
        {
            documentHistoryId: 'dh-010',
            documentId: 'd-008',
            changedBy: 'user-003',
            action: DocumentStatus.invalid,
            createdAt: new Date('2025-06-06T11:15:00Z'),
            commentary: 'Missing ID number.',
        },
        {
            documentHistoryId: 'dh-011',
            documentId: 'd-008',
            changedBy: 'user-001',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-06T13:00:00Z'),
        },
        {
            documentHistoryId: 'dh-012',
            documentId: 'd-009',
            changedBy: 'user-001',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-06T14:00:00Z'),
        },
        {
            documentHistoryId: 'dh-013',
            documentId: 'd-010',
            changedBy: 'user-002',
            action: DocumentStatus.invalid,
            createdAt: new Date('2025-06-06T15:00:00Z'),
            commentary: 'Signed by wrong department.',
        },
        {
            documentHistoryId: 'dh-014',
            documentId: 'd-011',
            changedBy: 'user-002',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-06T15:30:00Z'),
        },
        {
            documentHistoryId: 'dh-015',
            documentId: 'd-012',
            changedBy: 'user-001',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-06T16:00:00Z'),
        },
        {
            documentHistoryId: 'dh-016',
            documentId: 'd-013',
            changedBy: 'user-001',
            action: DocumentStatus.invalid,
            createdAt: new Date('2025-06-06T16:30:00Z'),
            commentary: 'Mismatch in names.',
        },
        {
            documentHistoryId: 'dh-017',
            documentId: 'd-014',
            changedBy: 'user-003',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-06T17:00:00Z'),
        },
        {
            documentHistoryId: 'dh-018',
            documentId: 'd-015',
            changedBy: 'user-001',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-06T17:30:00Z'),
        },
        {
            documentHistoryId: 'dh-019',
            documentId: 'd-016',
            changedBy: 'user-001',
            action: DocumentStatus.invalid,
            createdAt: new Date('2025-06-06T18:00:00Z'),
            commentary: 'File corrupted.',
        },
        {
            documentHistoryId: 'dh-020',
            documentId: 'd-017',
            changedBy: 'user-001',
            action: DocumentStatus.valid,
            createdAt: new Date('2025-06-06T18:30:00Z'),
        },
    ]
    return mockDocumentHistory
}
