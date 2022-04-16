export interface Subscription {
  unsubscribe: () => void;
}

export interface Observable<T> {
  subscribe(f: (data: T) => void): Subscription;
  notify(data: T): void;
}

export const createObservable = <T>(init: () => () => void): Observable<T> => {
  let last: () => void;
  let observers: ((value: T) => void)[] = [];
  const subscribe = (f: (data: T) => void) => {
    if (observers.length === 0) {
      last = init();
    }
    observers.push(f);
    return {
      unsubscribe: () => {
        observers = observers.filter((other) => other !== f);
        if (observers.length === 0) {
          last();
        }
      },
    };
  };
  const notify = (data: T) => {
    observers.forEach((observer) => observer(data));
  };

  return { subscribe, notify };
};

export const mergeObservable = <T>(
  ...observables: Observable<T>[]
): Observable<T> => {
  const globalObservable = createObservable<T>(() => {
    const subscriptions: Subscription[] = observables.map((observable) =>
      observable.subscribe((data) => globalObservable.notify(data))
    );
    return () =>
      subscriptions.forEach((subscription) => subscription.unsubscribe());
  });

  return globalObservable;
};
