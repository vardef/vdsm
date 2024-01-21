import { expect, test, describe } from "bun:test";
import { get, register } from '../src/factory';
import { vdsm } from '../src';

enum ArticleState1 {
    Draft,
    Published,
    Archived,
    PendingApproval
}

enum ArtileEvent1 {
    Create,
    Edit,
    Publish,
    Archive,
    SubmitForApproval,
}

enum ArtileEvent2 {
    Create = 'create',
    Edit = 'edit',
    Publish = 'publish',
    Archive = 'archive',
    SubmitForApproval = 'submit_for_approval',
}

enum ArticleState2 {
    Draft = 'draft',
    Published = 'published',
    Archived = 'archived',
    PendingApproval = 'pending_approval',
}

interface ReqContext {
    id: string
}

describe('get', () => {
    test("Error should be triggered on get a not exists stateMachineId..", () => {
        let err = null;
        try {
            get('this is not exists');
        } catch (e) {
            err = e;
        }
        expect(err).not.toBeNull();
    });

    test("should ok", () => {
        const builder = vdsm.create<ReqContext>();
        const stateMachineId = "this is exists";
        builder.internalTransition().within(ArticleState1.Draft)
            .on(ArtileEvent1.Edit).when(ctx => ctx.id === '1')
            .perform((from, to, event, context) => {
                console.log(`${from} -> ${to} on ${event} ,context = ${context}`);
            });
        ;
        builder.build(stateMachineId);
        const stateMachine = get(stateMachineId);
        expect(stateMachine).toBeObject();
    });
});


describe('register', () => {
    test("should ok", () => {
        const notExistsKey = `this is not exists key ${Date.now()}`;
        const stateMachine = {
            verify(state: string, event: string): boolean { return true },

            fireEvent(state: string, event: string): string { return '' },

            getStateMachineId(): string {
                return notExistsKey;
            },
            displayStateMachine(): void { },
            generatePlantUml(): string { return '' },
            accept(visitor: any): String {
                return '';
            }
        };
        register(stateMachine);

    });
    test("Error should be triggered on repeated registration..", () => {
        const notExistsKey = `this_is_not_exists_key_1_${Date.now()}`;
        const stateMachine = {
            verify(state: string, event: string): boolean { return true },

            fireEvent(state: string, event: string): string { return '' },

            getStateMachineId(): string {
                return notExistsKey;
            },
            displayStateMachine(): void { },
            generatePlantUml(): string { return '' },
            accept(visitor: any): String {
                return '';
            }
        };
        register(stateMachine);
        let err = null;
        try {
            register(stateMachine);
        } catch (e) {
            err = e;
        }
        expect(err).not.toBeNull();
    });
});
