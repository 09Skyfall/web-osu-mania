export type UnsubscribeCallback = () => void;

export type PublishParameters<
  EventsDict extends Record<string, unknown>,
  Event extends keyof EventsDict & string,
> = EventsDict[Event] extends void ? [name: Event] : [name: Event, payload: EventsDict[Event]];

export type SubscribeParameters<
  EventsDict extends Record<string, unknown>,
  Event extends keyof EventsDict & string,
> = EventsDict[Event] extends void
  ? [event: Event, cb: () => unknown, options?: AddEventListenerOptions]
  : [event: Event, cb: (value: EventsDict[Event]) => unknown, options?: AddEventListenerOptions];

export class Subscribable<EventsDict extends Record<string, unknown>> extends EventTarget {
  subscribe<T extends keyof EventsDict & string>(
    ...args: SubscribeParameters<EventsDict, T>
  ): UnsubscribeCallback {
    const [event, cb, options] = args;

    const eventHandler = (e: Event) => cb((e as CustomEvent).detail);

    this.addEventListener(event, eventHandler, options);

    return () => this.removeEventListener(event, eventHandler);
  }

  publish<T extends keyof EventsDict & string>(...args: PublishParameters<EventsDict, T>): void {
    const [name, payload] = args;

    const event = payload ? new CustomEvent(name, { detail: payload }) : new CustomEvent(name);

    this.dispatchEvent(event);
  }
}
