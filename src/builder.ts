import { StateMachineId, StateEnum, From, To, State, TransitionType, Condition, EventEnum, Action, On, StateMachine, Transition, When } from "./types";
import { ConsoleVisitor, PlantUmlVisitor, Visitor } from "./visitor";
import { StateImpl } from "./sm";
import { register } from "./factory";

export interface InternalTransitionBuilder<Context> {
    from(state: StateEnum): From<Context>;
}

export interface ExternalTransitionsBuilder<Context> {
    fromAmong(...states: StateEnum[]): From<Context>;
}

export interface ExternalTransitionBuilder<Context> {
    within(state: StateEnum): To<Context>;
}
export interface StateMachineBuilder<Context> {
    externalTransition(): InternalTransitionBuilder<Context>;
    externalTransitions(): ExternalTransitionsBuilder<Context>;
    internalTransition(): ExternalTransitionBuilder<Context>;
    parseTransition(expression: string): On<Context>;
    build(stateMachineId: StateMachineId): StateMachine<Context>;
}

abstract class AbsTransitionBuilder<Context> implements From<Context>, To<Context>, On<Context> {

    readonly stateMap: Map<StateEnum, State<Context>>;
    protected target!: State<Context>;
    readonly transitionType: TransitionType;
    constructor(stateMap: Map<StateEnum, State<Context>>, transitionType: TransitionType) {
        this.stateMap = stateMap;
        this.transitionType = transitionType;
    }
    to(state: StateEnum): To<Context> {
        this.target = this.mustGet(state);
        return this;
    }
    mustGet(state: StateEnum): State<Context> {
        let _target = this.stateMap.get(state);
        if (!_target) {
            _target = new StateImpl<Context>(state);
            this.stateMap.set(state, _target);
        }
        return _target;
    }

    abstract on(event: EventEnum): On<Context>;
    abstract when(isSatisfied: Condition<Context>): When<Context>;
    abstract perform<T>(action: Action<Context>): void;
}

class TransitionsBuilderImpl<Context> extends AbsTransitionBuilder<Context> implements ExternalTransitionsBuilder<Context> {
    private sources: State<Context>[] = [];
    private transitions: Transition<Context>[] = [];

    constructor(stateMap: Map<StateEnum, State<Context>>, transitionType: TransitionType) {
        super(stateMap, transitionType);
    }

    fromAmong(...states: StateEnum[]): From<Context> {
        for (let state of states) {
            this.sources.push(this.mustGet(state));
        }
        return this;
    }

    on(event: EventEnum): On<Context> {
        for (let source of this.sources) {
            const transition = source.addTransition(event, this.target, this.transitionType);
            this.transitions.push(transition);
        }
        return this;
    }

    when(isSatisfied: Condition<Context>): When<Context> {
        for (let transition of this.transitions) {
            transition.setCondition(isSatisfied);
        }
        return this;
    }
    perform<T>(action: Action<Context>): void {
        for (let transition of this.transitions) {
            transition.setAction(action);
        }
    }

}

class TransitionBuilderImpl<Context> extends AbsTransitionBuilder<Context> implements InternalTransitionBuilder<Context>, ExternalTransitionBuilder<Context>{
    private source!: State<Context>;
    private transition!: Transition<Context>;

    constructor(stateMap: Map<StateEnum, State<Context>>, transitionType: TransitionType) {
        super(stateMap, transitionType);
    }
    from(state: StateEnum): From<Context> {
        this.source = this.mustGet(state);
        return this;
    }

    within(state: StateEnum): To<Context> {
        this.source = this.target = this.mustGet(state);
        return this;
    }
    when(isSatisfied: Condition<Context>): When<Context> {
        this.transition.setCondition(isSatisfied);
        return this;
    }

    on(event: StateEnum): On<Context> {
        this.transition = this.source.addTransition(event, this.target, this.transitionType);
        return this;
    }

    perform<T>(action: Action<Context>): void {
        this.transition.setAction(action);
    }

}

class ParseTransitionBuilderImpl<Context> extends AbsTransitionBuilder<Context> implements On<Context>{

    private transitions: Transition<Context>[] = [];
    constructor(stateMap: Map<StateEnum, State<Context>>, transitionType: TransitionType, expression: string) {
        super(stateMap, transitionType);
        this.parse(expression);
    }
    private parse(expression: string): void {
        //FIXME simple implementation, to be optimized.
        const regex = /^\s*([\w\s]+)\s*-->\s*([\w\s]+)\s*:\s*(\w+)\s*$/;
        if (!expression) {
            throw new Error('expression must exists.');
        }
        const lines = expression.split('\n');
        let idx = 0;
        for (let line of lines) {
            line = line.replaceAll('@startuml', '').replaceAll('@enduml', '');
            if (line.trim() === '' || line.indexOf('[*]') >= 0) {
                continue;
            }
            idx++;
            const match = line.match(regex);
            if (!match) {
                throw new Error(`Invalid expression,line:${idx},${line}`);
            }
            const [, from, to, event] = match;
            const sourceState = this.mustGet(from);
            let newTransition: Transition<Context>;
            if (from === to) {
                newTransition = sourceState.addTransition(event, this.mustGet(to), TransitionType.INTERNAL);
            } else {
                newTransition = sourceState.addTransition(event, this.mustGet(to), TransitionType.EXTERNAL);
            }
            this.transitions.push(newTransition);
        }
    }

    when(isSatisfied: Condition<Context>): When<Context> {
        for (let transition of this.transitions) {
            transition.setCondition(isSatisfied);
        }
        return this;
    }

    perform<T>(action: Action<Context>): void {
        for (let transition of this.transitions) {
            transition.setAction(action);
        }
    }
    on(event: string): On<Context> {
        throw new Error("Method not implemented.");
    }
}



class StateMachineImpl<Context> implements StateMachine<Context> {
    private stateMachineId!: StateMachineId;
    private stateMap: Map<StateEnum, State<Context>>;
    private ready!: boolean;

    constructor(stateMap: Map<StateEnum, State<Context>>) {
        this.stateMap = stateMap;
    }

    verify(state: StateEnum, event: EventEnum): boolean {
        this.isReady();
        const sourceState = this.getState(state);
        const transitions = sourceState.getEventTransitions(event);
        return transitions && transitions.length > 0;
    }
    fireEvent(source: StateEnum, event: EventEnum, context: Context): StateEnum {
        this.isReady();
        // route
        const transition = this.routeTransition(source, event, context);
        if (transition == null) {
            return source;
        }
        return transition.transit(context, false).getId();
    }
    getStateMachineId(): StateMachineId {
        return this.stateMachineId;
    }


    setStateMachineId(stateMachineId: StateMachineId) {
        this.stateMachineId = stateMachineId;
    }

    displayStateMachine(): void {
        const conoleVisitor = new ConsoleVisitor<Context>();
        this.accept(conoleVisitor);
    }
    generatePlantUml(): string {
        const plantUmlVisitor = new PlantUmlVisitor<Context>();
        return this.accept(plantUmlVisitor);
    }

    private getState(state: StateEnum): State<Context> {
        return this.mustGet(state);
    }
    private routeTransition(source: StateEnum, event: EventEnum, context: Context): Transition<Context> | null {
        const sourceState = this.getState(source);
        const transitions = sourceState.getEventTransitions(event);
        if (!transitions || transitions.length == 0) {
            return null;
        }
        let transit: Transition<Context> | null = null;
        for (const transition of transitions) {
            const condition = transition.getCondition();
            if (condition === null) {
                transit = transition;
            } else if (condition(context)) {
                transit = transition;
                break;
            }
        }
        return transit;
    }

    accept(visitor: Visitor<Context>): string {
        let sb = visitor.visitOnEntry(this);
        for (let state of this.stateMap.values()) {
            sb += state.accept(visitor);
        }
        sb += visitor.visitOnExit(this);
        return sb;
    }

    isReady() {
        if (this.ready) {
            return;
        }
        throw new Error("State machine is not built yet, can not work");
    }

    private mustGet(state: StateEnum): State<Context> {
        let _target = this.stateMap.get(state);
        if (!_target) {
            _target = new StateImpl<Context>(state);
            this.stateMap.set(state, _target);
        }
        return _target;
    }

    setReady(isReady: boolean) {
        this.ready = isReady;
    }

}

export class StateMachineBuilderImpl<Context> implements StateMachineBuilder<Context> {
    private stateMap: Map<StateEnum, State<Context>> = new Map();
    private stateMachine: StateMachineImpl<Context> = new StateMachineImpl(this.stateMap);
    externalTransition(): InternalTransitionBuilder<Context> {
        return new TransitionBuilderImpl(this.stateMap, TransitionType.EXTERNAL);
    }
    externalTransitions(): ExternalTransitionsBuilder<Context> {
        return new TransitionsBuilderImpl(this.stateMap, TransitionType.EXTERNAL);
    }
    internalTransition(): ExternalTransitionBuilder<Context> {
        return new TransitionBuilderImpl(this.stateMap, TransitionType.INTERNAL);
    }
    parseTransition(expression: string): On<Context> {
        return new ParseTransitionBuilderImpl(this.stateMap, TransitionType.MIX, expression);
    }
    build(stateMahineId: StateMachineId): StateMachine<Context> {
        this.stateMachine.setStateMachineId(stateMahineId);
        this.stateMachine.setReady(true);

        register(this.stateMachine);
        return this.stateMachine;
    }

}
