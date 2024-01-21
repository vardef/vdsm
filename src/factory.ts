import { StateMachine, StateMachineId } from "./types";
// global cache
const stateMachineMap = new Map<StateMachineId, StateMachine<any>>();
export function register<Context>(stateMachine: StateMachine<Context>): void {
    const stateMachineId = stateMachine.getStateMachineId();
    if (stateMachineMap.has(stateMachineId)) {
        throw new Error(`The state machine with id [${stateMachineId}] is already built, no need to build again`);
    }
    stateMachineMap.set(stateMachineId, stateMachine);
}

export function get<Context>(stateMachineId: StateMachineId): StateMachine<Context> {
    const stateMachine = stateMachineMap.get(stateMachineId);
    if (!stateMachine) {
        throw new Error(`No state machine instance found for id ${stateMachineId}. Please build it first.`);
    }
    return stateMachine;
}
