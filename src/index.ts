
import { type StateMachineBuilder, StateMachineBuilderImpl } from "./builder";
import { get } from './factory';

function create<Context>(): StateMachineBuilder<Context> {
    return new StateMachineBuilderImpl<Context>();
}

export const vdsm = {
    create,
    get
}
