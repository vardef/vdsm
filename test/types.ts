export enum ArticleEvent {
    Create = 'create',
    Edit = 'edit',
    Publish = 'publish',
    Archive = 'archive',
    SubmitForApproval = 'submit_for_approval',
}

export enum ArticleState {
    Draft = 'draft',
    Published = 'published',
    Archived = 'archived',
    PendingApproval = 'pending_approval',
}

export interface ReqContext {
    id: string
}
