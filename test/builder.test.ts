import { expect, test, describe } from "bun:test";

import { vdsm } from '../src';

describe('externalTransitions', () => {
    test("should ok", () => {
        const builder = vdsm.create();
    });
});
describe('internalTransition', () => {
    test("should ok", () => {
        const builder = vdsm.create();
    });
});

describe('parseTransition', () => {
    test("should error , invalid express", () => {
        const builder = vdsm.create();
        let err = null;
        try {
            builder.parseTransition('')
        } catch (e) {
            err = e;
        }
        expect(err).not.toBeNull();
    });

    test("should ok , express one line", () => {
        const plantuml_express_state_machine_test = 'plantuml_express_state_machine_test';
        const builder = vdsm.create();
        builder.parseTransition(`
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
        console.log('--->>\n' + vdsm.get(plantuml_express_state_machine_test).generatePlantUml());

    });

    test("should ok , express multi lines", () => {
        const builder = vdsm.create();
        builder.parseTransition(`
        draft --> archived:archive
        draft --> pending_approval : submit_for_approval
        `);
    });
});