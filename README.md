# vdsm

a simple, lightweight state machine.

## Description

Current status: WIP, production environment is not ready yet.
a simple, lightweight, and highly performant state machine DSL implementation, simplify state transition issues in business .

## Features

- simple
- lightweight
- no dependencies

## Getting Started

### Installation

```bash
import {vdsm} from 'vdsm';

npm save vdsm

or

bun add vdsm

or

pnpm save vdsm

```

### Usage

#### simple

```typescript
// Just build once,
import { vdsm } from "vdsm";

const builder = vdsm.create();
// draft --> published : ev_publish
builder.internalTransition().from("draft").to("published").on("ev_publish");
builder.build("article_state_machine");

//use it anywhere.

const stateMachine = vdsm.get("article_state_machine");

const nextState = stateMachine.fireEvent("draft", "ev_publish");
// nextState == published

console.log(stateMachine.generatePlantUml());
// will print
// draft --> published : ev_publish
```

#### externalTransitions

```typescript
// Just build once,
import { vdsm } from "vdsm";

const builder = vdsm.create();
// state1 --> state2 : ev_name

// draft --> published : ev_publish
//  pending_approval --> published : ev_publish
builder
  .externalTransitions()
  .fromAmount("draft", "pending_approval")
  .to("published")
  .on("ev_publish");
builder.build("article_state_machine");

//use it anywhere.

const stateMachine = vdsm.get("article_state_machine");

const nextState = stateMachine.fireEvent("pending_approval", "ev_publish");
// nextState == published
```

#### internalTransition

```typescript
// Just build once,
import { vdsm } from "vdsm";

const builder = vdsm.create();
// state1 --> state1 : ev_name

// draft --> draft : edit

builder.internalTransition().within("draft").on("edit");
builder.build("article_state_machine");

//use it anywhere.

const stateMachine = vdsm.get("article_state_machine");

const nextState = stateMachine.fireEvent("pendindraftg_approval", "edit");
// nextState == edit
```

#### parseTransition

> parse plantuml expression

```typescript
// Just build once,
import { vdsm } from "vdsm";

const builder = vdsm.create();
// state1 --> state1 : ev_name

// draft --> draft : edit

builder.parseTransition(
  `
  @startuml
        [*] -> draft
        draft --> draft : edit
        draft --> pending_approval : submit_for_approval
        pending_approval --> published: approve
        pending_approval --> rejected: reject
        rejected --> draft: edit
        published --> [*]
        @enduml
`
);
builder.build("article_state_machine");

//use it anywhere.

const stateMachine = vdsm.get("article_state_machine");

const nextState = stateMachine.fireEvent("pending_approval", "reject");
// nextState == rejected
```

## Contributing

If you'd like to contribute, please follow these guidelines.

## License

This project is licensed under the [MIT] - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by https://github.com/alibaba/COLA/tree/master/cola-components/cola-component-statemachine
