import { DocumentStatus } from '@/types'

export class RejectDocumentDto {
    statusId: string
    comment?: string

    constructor(statusId: DocumentStatus, comment?: string) {
        ;(this.statusId = this.handleStatus(statusId)), (this.comment = comment)
    }

    handleStatus(statusId: DocumentStatus) {
        switch (statusId) {
            case DocumentStatus.pending_review:
                return '01974b23-bc2f-7e5f-a9d0-73a5774d2778'
            case DocumentStatus.approved:
                return '01974b23-d84d-7319-95b3-02322c982216'
            case DocumentStatus.rejected:
                return '01974b23-e943-7308-8185-1556429b9ff1'
            case DocumentStatus.deleted:
                return '01974b24-093b-7014-aa21-9f964b822156'
            default:
                return '01974b23-bc2f-7e5f-a9d0-73a5774d2778'
        }
    }
}
