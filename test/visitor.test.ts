import { expect, test, describe, beforeAll } from "bun:test";
import { vdsm } from '../src';
import { ArticleState, ArticleEvent } from './types';

const visitorStateMachineKey = 'visitorStateMachineKey';

beforeAll(() => {
    console.log('visitor test ts');
    const builder = vdsm.create();
    // draft --> draft : edit
    // draft --> pending_approval : submit_for_approval
    builder.internalTransition()
        .within(ArticleState.Draft)
        .on(ArticleEvent.Edit);
    // draft ->  PendingApproval on SubmitForApproval
    builder.externalTransition()
        .from(ArticleState.Draft)
        .to(ArticleState.PendingApproval)
        .on(ArticleEvent.SubmitForApproval);

    builder.build(visitorStateMachineKey);
});

describe('ConsoleVisitor', () => {

    test("Error should be triggered on get a not exists stateMachineId..", () => {

    });

    test("should ok", () => {
        const stateMachine = vdsm.get(visitorStateMachineKey);
        stateMachine.displayStateMachine();
        const planUml = stateMachine.generatePlantUml();
        console.log(planUml);
    });
});



