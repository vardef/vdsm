import { State, StateMachine } from "./types";
const LF = "\n";
const START_UML = `@startuml${LF}`;
const END_UML = "@enduml";

export interface Visitor<Context> {
    visitOnEntry(visitable: StateMachine<Context>): string;
    visitOnExit(visitable: StateMachine<Context>): string;
    visitStateOnEntry(visitable: State<Context>): string;
    visitStateOnExit(visitable: State<Context>): string;
}

export interface Visitable<Context> {
    accept(visitor: Visitor<Context>): String;
}

export class ConsoleVisitor<Context> implements Visitor<Context> {
    visitOnEntry(stateMachine: StateMachine<Context>): string {
        const entry = `-----StateMachine:${stateMachine.getStateMachineId()}-------`;
        console.log(entry);
        return entry;
    }
    visitOnExit(visitable: StateMachine<Context>): string {
        const exit = "------------------------";
        console.log(exit);
        return exit;
    }
    visitStateOnEntry(state: State<Context>): string {
        const sb: string[] = [`State:${state.getId()}`];
        console.log(sb);
        for (const transition of state.getAllTransitions()) {
            const transitionStr = `    Transition:${transition.toString()}`;
            sb.push(transitionStr);
            console.log(transitionStr);
        }
        return sb.join(LF);
    }
    visitStateOnExit(visitable: State<Context>): string {
        return "";
    }
}

export class PlantUmlVisitor<Context> implements Visitor<Context> {
    private states: State<Context>[] = [];
    visitOnEntry(visitable: StateMachine<Context>): string {
        return START_UML;
    }
    visitOnExit(visitable: StateMachine<Context>): string {
        const beginStates = new Set<string>();
        const endStates = new Set<string>();

        for (const state of this.states) {
            for (const transition of state.getAllTransitions()) {
                beginStates.add(transition.getSource().getId());
                endStates.add(transition.getTarget().getId())
            }
        }
        let statesUml = '';
        for (const beginState of beginStates) {
            statesUml += `[*] -> ${beginState} ${LF}`;
        }

        for (const state of this.states) {
            for (const transition of state.getAllTransitions()) {
                if (!transition.getSource().equals(transition.getTarget())) {
                    console.log('beginStates', beginStates, 'rm', transition.getSource().getId(), '-->', transition.getTarget().getId());
                    // console.log(endStates, 'rm', transition.getSource().getId());
                    beginStates.delete(transition.getTarget().getId());
                    endStates.delete(transition.getSource().getId());
                }
                statesUml += `${transition.getSource().getId()} --> ${transition.getTarget().getId()} : ${transition.getEvent()} ${LF}`;
            }
        }

        for (const endState of endStates) {
            statesUml += `${endState} --> [*] ${LF}`;
        }
        return statesUml + END_UML;
    }

    visitStateOnEntry(state: State<Context>): string {
        this.states.push(state);
        return "";
    }
    visitStateOnExit(visitable: State<Context>): string {
        return "";
    }

}