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
        const parse_full_plantuml_test = 'parse_full_plantuml_test';
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
        builder.build(parse_full_plantuml_test);
        const stateMachine = vdsm.get(parse_full_plantuml_test);

        const after = stateMachine.fireEvent('draft', 'edit');

        expect(stateMachine).not.toBeEmpty();
        expect(after).toEqual('draft');


    });

    test("parse multi lines", () => {
        const parse_multi_lines_test = 'parse_multi_lines_test';
        const builder = vdsm.create();
        builder.parseTransitions(`
        draft --> archived : archive
        draft --> pending_approval : submit_for_approval
        `);
        builder.build(parse_multi_lines_test);
        const stateMachine = vdsm.get(parse_multi_lines_test);

        const after = stateMachine.fireEvent('draft', 'archive');

        expect(stateMachine).not.toBeEmpty();
        expect(after).toEqual('archived');


    });
});