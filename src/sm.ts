
import { Transition, State, EventEnum, Action, Condition, TransitionType, StateEnum } from "./types";
import { Visitor } from "./visitor";

export class TransitionImpl<Context> implements Transition<Context>{
    private source!: State<Context>;
    private target!: State<Context>;

    private event!: EventEnum;

    private action!: Action<Context>;

    private condition!: Condition<Context>;

    private type: TransitionType = TransitionType.EXTERNAL;


    getSource(): State<Context> {
        return this.source;
    }
    setSource(source: State<Context>): void {
        this.source = source;
    }
    getTarget(): State<Context> {
        return this.target;
    }
    setTarget(target: State<Context>): void {
        this.target = target;
    }
    getEvent(): EventEnum {
        return this.event;
    }
    setEvent(event: EventEnum): void {
        this.event = event;
    }
    setAction(action: Action<Context>): void {
        this.action = action;
    }
    setType(type: TransitionType): void {
        this.type = type;
    }

    getAction<T>() {
        return this.action;
    }
    setCondition(condition: Condition<Context>): void {
        this.condition = condition;
    }
    getCondition(): Condition<Context> {
        //throw new Error('Method not implemented.');
        return this.condition;
    }
    transit(context: Context, skipCondition: boolean): State<Context> {
        this.verify();
        if (skipCondition || this.condition == undefined || this.condition(context)) {
            this.action && this.action(this.source.getId(), this.target.getId(), this.event, context);
            return this.target;
        }

        return this.source;
    }

    equals(other: Transition<Context> | null): boolean {
        if (other == null) {
            return false;
        }
        // event ,target ,source must be equals
        if (this.event !== other.getEvent()) {
            return false;
        }
        if (!this.source.equals(this.source)) {
            return false;
        }
        if (!this.target.equals(this.target)) {
            return false;
        }
        return true;
    }

    verify(): void {
        if (this.type !== TransitionType.INTERNAL) {
            return;
        }
        if (this.source === this.target) {
            return;
        }

        throw new Error(`StateMachine: Internal transition source state ${this.source} and target status ${this.target} must be same.`);
    }
    toString(): string {
        return `${this.source.getId()}-[${this.event},${this.type}]-> ${this.target.getId()}`;
    }

}


class EventTransitions<Context> {
    private eventTransitionMap: Map<EventEnum, Transition<Context>[]>;
    constructor() {
        this.eventTransitionMap = new Map();
    }

    put(event: EventEnum, newTransition: Transition<Context>): void {
        const existsTransitions = this.eventTransitionMap.get(event);
        if (!existsTransitions) {
            this.eventTransitionMap.set(event, [newTransition]);
        } else {
            this.verify(existsTransitions, newTransition);
            existsTransitions.push(newTransition);
        }
    }
    verify(existsTransitions: Transition<Context>[], newTransition: Transition<Context>): void {
        for (let transition of existsTransitions) {
            if (transition.equals(newTransition)) {
                throw new Error(`${newTransition} already Exist, you can not add another one`);
            }
        }
    }
    get(event: EventEnum): Transition<Context>[] {
        return this.eventTransitionMap.get(event) || [];
    }

    allTransitions(): Transition<Context>[] {
        let all: Transition<Context>[] = [];
        for (let values of this.eventTransitionMap.values()) {
            all = all.concat(values);
        }
        return all;
    }

}


export class StateImpl<Context> implements State<Context> {
    private state: StateEnum;

    private eventTransitions: EventTransitions<Context> = new EventTransitions();

    constructor(state: StateEnum) {
        this.state = state;
    }

    getId(): StateEnum {
        return this.state;
    }
    addTransition(event: StateEnum, target: State<Context>, transitionType: TransitionType): Transition<Context> {
        const newTransition: Transition<Context> = new TransitionImpl();
        newTransition.setSource(this);
        newTransition.setTarget(target);
        newTransition.setEvent(event);
        newTransition.setType(transitionType);
        this.eventTransitions.put(event, newTransition);
        return newTransition;
    }
    getEventTransitions(event: StateEnum): Transition<Context>[] {
        return this.eventTransitions.get(event);
    }
    getAllTransitions(): Transition<Context>[] {
        return this.eventTransitions.allTransitions();
    }
    equals(other: State<Context> | null): boolean {
        if (!other) {
            return false;
        }
        return this.state === other.getId();
    }

    accept(visitor: Visitor<Context>): string {
        const entry = visitor.visitStateOnEntry(this);
        const exit = visitor.visitStateOnExit(this);
        return entry + exit;
    }

}