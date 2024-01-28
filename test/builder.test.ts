import { expect, test, describe } from "bun:test";

import { vdsm } from '../src';

describe('externalTransitions', () => {
    test("fromAmong", () => {
        const externalTransitions = 'externalTransitions',
            from = 'draft', to = 'published',
            publish = 'publish';
        const builder = vdsm.create();
        builder.externalTransitions().fromAmong(from, 'b', 'c').to(to).on(publish);
        builder.build(externalTransitions);
        const stateMachine = vdsm.get(externalTransitions);
        const after = stateMachine.fireEvent(from, publish);
        expect(after).toEqual(to);
    });
});
describe('internalTransition', () => {
    test("within", () => {
        const internalTransition = 'internalTransition',
            from = 'draft', to = 'draft',
            edit = 'edit';
        const builder = vdsm.create();
        builder.internalTransition().within(from).on(edit);
        builder.build(internalTransition);
        const stateMachine = vdsm.get(internalTransition);
        const after = stateMachine.fireEvent(from, edit);
        expect(after).toEqual(from);
    });
});

describe('parseTransition', () => {
    test("should error , invalid express", () => {
        const builder = vdsm.create();
        let err = null;
        try {
            builder.parseTransitions('')
        } catch (e) {
            err = e;
        }
        expect(err).not.toBeNull();
    });

    test("parse full plantuml", () => {
        const plantuml_express_state_machine_test = 'plantuml_express_state_machine_test';
        const builder = vdsm.create();
        builder.parseTransitions(`
        @startuml
        [*] -> draft
        draft --> draft : edit
        draft --> pending_approval : submit_for_approval
        pending_approval --> published: approve
        pending_approval --> rejected: reject
        rejected --> draft: edit
        published --> [*]
        @enduml
        `);
        builder.build(plantuml_express_state_machine_test);
        const plantUml = vdsm.get(plantuml_express_state_machine_test).generatePlantUml();
        expect(plantUml).not.toBeEmpty();
        expect(plantUml).toContain('@startuml');
        expect(plantUml).toContain('pending_approval --> rejected : reject');

    });

    test("parse multi lines", () => {
        const plantuml_express_one_line_test = 'plantuml_express_one_line_test';
        const builder = vdsm.create();
        builder.parseTransitions(`
        draft --> archived : archive
        draft --> pending_approval : submit_for_approval
        `);
        builder.build(plantuml_express_one_line_test);
        const plantUml = vdsm.get(plantuml_express_one_line_test).generatePlantUml();
        expect(plantUml).not.toBeEmpty();
        expect(plantUml).toContain('draft --> archived : archive');

    });
});