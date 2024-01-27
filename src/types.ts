import { Visitable } from "./visitor";

export type StateMachineId = string;

export type StateEnum = string;
export type EventEnum = string;

export type Condition<Context> = (context: Context) => boolean;

export type Action<Context> = (from: StateEnum, to: StateEnum, event: EventEnum, context: Context) => void;

export enum TransitionType {
    INTERNAL = "INTERNAL",
    LOCAL = "LOCAL",
    EXTERNAL = "EXTERNAL",
    MIX = "MIX",
}
export interface From<Context> {
    to(state: StateEnum): To<Context>;

}

export interface To<Context> {
    on(event: EventEnum): On<Context>;
}

export interface On<Context> extends When<Context> {
    when(isSatisfied: Condition<Context>): When<Context>;
}

export interface When<Context> {
    perform<T>(action: Action<Context>): void;
}

export interface To<Context> {
    on(event: EventEnum): On<Context>;
}
export interface StateMachine<Context> extends Visitable<Context> {
    verify(state: StateEnum, event: EventEnum): boolean;

    fireEvent(state: StateEnum, event: EventEnum, context: Context): StateEnum;

    getStateMachineId(): StateMachineId;

    displayStateMachine(): void;

    generatePlantUml(): string;

}

export interface State<Context> extends Visitable<Context> {
    getId(): StateEnum;

    addTransition(event: EventEnum, target: State<Context>, transitionType: TransitionType): Transition<Context>;

    getEventTransitions(event: EventEnum): Transition<Context>[];

    getAllTransitions(): Transition<Context>[];

    equals(other: State<Context> | null): boolean;

}


export interface Transition<Context> {
    getSource(): State<Context>;

    setSource(state: State<Context>): void;

    getTarget(): State<Context>;

    setTarget(state: State<Context>): void;

    getEvent(): EventEnum;

    setEvent(event: EventEnum): void;

    setAction(action: Action<Context>): void;

    setType(type: TransitionType): void;

    getAction(): Action<Context>;

    setCondition(condition: Condition<Context>): void;

    getCondition(): Condition<Context>;

    transit(context: Context, skipCondition: boolean): State<Context>;

    verify(): void;

    equals(other: Transition<Context> | null): boolean;

    toString(): string;
}