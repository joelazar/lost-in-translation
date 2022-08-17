---
author: joelazar
date: YYYY-MM-dd
paging: Slide %d / %d
---

# Lost in translation - Remix edition

Remix copenhagen

---

## Who am I?

Jozsef Lazar

### About

- mixed background
- worked 4 years at a large telecommunication ☎️ company
- gained experience with ☁️ cloud native services (docker,k8s,etcd)
- worked as computer vision engineer (embedded systems) 👀 and backend engineer (go) 💻 for a while
- currently I'm a full stack engineer at [Growblocks](https://growblocks.com/), working with Remix for over 6 months now

### Contact

- Github 🐙: @joelazar
- Mail 💌: joelazar@duck.com

---

## Let's start with a simple loader

There is a mistake in this code. Can you find it? 🔍

Code example --> https://github.com/joelazar/lost-in-translation/blob/before-1.6.5/app/routes/problem/index.tsx

---

## Explanation

### At page navigation

The client gets the code-split bundle for that page, and at time **same** time, the loader for that route gets evaluated, which is a **Fetch** request to the server. The response body of that request will be encoded in `JSON`, so it has to be serializable. Date and some other types don't have a native `JSON` representation.

```
┌────────────┐                       ┌─────────────┐
│     🖥️     ◄───code split bundle───┤     ☁️      │
│  browser   ◄───data from loader────┤   server    │
└────────────┘                       └─────────────┘
```

### At full reload

A full reload on the same route will do a full server render, and the data will be just embedded in the HTML. Loaders will be evaluated on the server side, but the data still has to be serializable there too.

```
┌────────────┐                       ┌─────────────┐
│     🖥️     ◄───full code bundle────┤     ☁️      │
│  browser   ◄────prefilled html─────┤   server    │
└────────────┘                       └─────────────┘
```

---

## OK types

- ✅ string
- ✅ number
- ✅ boolean
- ✅ null
- ✅ Array
- ✅ Object

---

## Problematic types

- ❌ Date
- ❌ BigInt
- ❌ Set
- ❌ Map
- ❌ RegExp
- ❌ undefined
- ❌ Error
- ❌ NaN

---

## Linter warning since remix 1.6.5

Code example --> https://github.com/joelazar/lost-in-translation/blob/after-1.6.5/app/routes/problem/index.tsx

---

## How to solve it - stupid solution

Code example --> https://github.com/joelazar/lost-in-translation/blob/after-1.6.5/app/routes/problem/index.tsx

---

## How to solve it - proper solution - requirements 1

### New features since remix 1.6.5

"We enhanced the type signatures of loader and useLoaderData to make it possible to infer the data type from return type of its related server function. To enable this feature, you will need to use the LoaderArgs type from your Remix runtime package instead of typing the function directly:"

```typescript
import type { LoaderFunction } from '@remix-run/[runtime]';
// -->
import type { LoaderArgs } from '@remix-run/[runtime]';

export const loader: LoaderFunction = async (args) => {
  return json<LoaderData>(data);
};
// -->
export async function loader(args: LoaderArgs) {
  return json(data);
}
```

---

## How to solve it - proper solution - requirements 1

### New features since remix 1.6.5

"Then you can infer the loader data by using typeof loader as the type variable in useLoaderData:

```typescript
let data = useLoaderData() as LoaderData;
// -->
let data = useLoaderData<typeof loader>();
```

With this change you no longer need to manually define a LoaderData type (huge time and typo saver!), and we serialize all values so that useLoaderData can't return types that are impossible over the network, such as Date objects or functions."

https://github.com/remix-run/remix/releases/tag/remix%401.6.5

---

## How to solve it - proper solution - requirements 2

### remix-typedjson

Drop in replacement for `useLoaderData`/`json` calls --> it will automatically convert your non-serializable types back and forth.

```typescript
const loaderData = useLoaderData<typeof loader>();
// -->
const loaderData = useTypedLoaderData<typeof loader>();
```

and

```typescript
return json({...})
// -->
return typedjson({...})
```

---

## How to solve it - proper solution

Code example --> https://github.com/joelazar/lost-in-translation/blob/proper-solution/app/routes/problem/index.tsx

---

## What about other Remix API?

Actions and fetchers are affected as well, but remix-typedjson handles them.

```typescript
const actionData = useTypedActionData<typeof action>();
```

and

```typescript
const fetcher = useTypedFetcher<typeof action>();
```

---

## Could it be solved with superjson?

Yes, of course.

```typescript
import { deserialize, serialize } from "superjson";
...
export const loader: LoaderFunction = async () => {
  const notes = await prisma.note.findMany({});
  return json(serialize({ notes }));
};

export default function Problem() {
  const { notes } = deserialize(
    useLoaderData() as SuperJSONResult
  ) as LoaderData;
  ...
}
```

https://github.com/blitz-js/superjson

---

## Thank you for the attention 🙏

Link for the presentation and code examples:
github.com/joelazar/lost-in-translation

Q: Do you get the title of the presentation now? 😃🍿
