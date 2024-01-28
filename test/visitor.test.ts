import { expect, test, describe, beforeAll } from "bun:test";
import { vdsm } from '../src';
import { ArticleState, ArticleEvent } from './types';

const visitorStateMachineKey = 'visitorStateMachineKey';

beforeAll(() => {
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
        const builder = vdsm.create();
        builder.parseTransitions(' a --> b :c');
        let err = null;
        try {
            builder.build(visitorStateMachineKey)
        } catch (e) {
            err = e;
        }
        expect(err).not.toBeNull();
    });

    test("displayStateMachine", () => {
        const stateMachine = vdsm.get(visitorStateMachineKey);
        stateMachine.displayStateMachine();
    });
});

describe('PlantUmlVisitor', () => {
    test("externalTransitions().fromAmong", () => {
        const builder = vdsm.create();
        const eventToC = 'eventToC', PlantUmlVisitor_externalTransitions_fromAmong = 'PlantUmlVisitor_externalTransitions_fromAmong';
        builder.externalTransitions().fromAmong('a', 'b').to('c').on(eventToC);
        builder.build(PlantUmlVisitor_externalTransitions_fromAmong);

        const stateMachine = vdsm.get(PlantUmlVisitor_externalTransitions_fromAmong);
        const plantUml = stateMachine.generatePlantUml();
        expect(plantUml).toContain('a --> c : eventToC');
        expect(plantUml).toContain('b --> c : eventToC');

    });

    test("externalTransition().from", () => {
        const builder = vdsm.create();
        const eventToD = 'eventToD', PlantUmlVisitor_externalTransition_from = 'PlantUmlVisitor_externalTransition_from';
        builder.externalTransition().from('a').to('d').on(eventToD);
        builder.externalTransition().from('b').to('d').on(eventToD);

        builder.build(PlantUmlVisitor_externalTransition_from);

        const stateMachine = vdsm.get(PlantUmlVisitor_externalTransition_from);
        const plantUml = stateMachine.generatePlantUml();
        expect(plantUml).toContain('a --> d : eventToD');
        expect(plantUml).toContain('b --> d : eventToD');

    });

    test("parseTransitions", () => {
        const builder = vdsm.create();
        const eventToD = 'eventToD', PlantUmlVisitor_parseTransitions = 'PlantUmlVisitor_parseTransitions';
        builder.parseTransitions(`
        a --> d : ${eventToD}
        b --> d : ${eventToD}
        `);
        builder.build(PlantUmlVisitor_parseTransitions);
        const stateMachine = vdsm.get(PlantUmlVisitor_parseTransitions);
        const plantUml = stateMachine.generatePlantUml();
        expect(plantUml).toContain(`a --> d : ${eventToD}`);
        expect(plantUml).toContain(`b --> d : ${eventToD}`);
    });

});




