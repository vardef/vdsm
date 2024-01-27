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

    visitOnEntry(visitable: StateMachine<Context>): string {
        return START_UML;
    }
    visitOnExit(visitable: StateMachine<Context>): string {
        return END_UML;
    }

    visitStateOnEntry(state: State<Context>): string {
        let sb = '';
        for (const transition of state.getAllTransitions()) {
            sb += `${transition.getSource().getId()} --> ${transition.getTarget().getId()} : ${transition.getEvent()} ${LF}`;
        }
        return sb;

    }
    visitStateOnExit(visitable: State<Context>): string {
        return "";
    }

}