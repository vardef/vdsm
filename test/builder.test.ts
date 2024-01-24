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
        const builder = vdsm.create();
        builder.parseTransition('draft-->archived:archive');
    });

    test("should ok , express multi lines", () => {
        const builder = vdsm.create();
        builder.parseTransition(`
        draft --> archived:archive
        draft --> pending_approval : submit_for_approval
        `);
    });
});