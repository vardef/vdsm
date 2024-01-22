export enum ArticleState1 {
    Draft,
    Published,
    Archived,
    PendingApproval
}

export enum ArtileEvent1 {
    Create,
    Edit,
    Publish,
    Archive,
    SubmitForApproval,
}

export enum ArtileEvent2 {
    Create = 'create',
    Edit = 'edit',
    Publish = 'publish',
    Archive = 'archive',
    SubmitForApproval = 'submit_for_approval',
}

export enum ArticleState2 {
    Draft = 'draft',
    Published = 'published',
    Archived = 'archived',
    PendingApproval = 'pending_approval',
}

export interface ReqContext {
    id: string
}
