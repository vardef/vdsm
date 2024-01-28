import { expect, test, describe } from "bun:test";

import { vdsm } from '../src';


describe('parseTransition', () => {


    test("state machine", () => {
        const stamachineTest = 'stamachineTest';
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

        builder.build(stamachineTest);
        const stateMachine = vdsm.get(stamachineTest);

        expect(stateMachine.getStateMachineId()).toEqual(stamachineTest);
        expect(stateMachine.verify('draft', 'edit')).toBeTrue();
        expect(stateMachine.verify('draft', 'not_exists')).toBeFalse();


    });


});
