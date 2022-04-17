import { createObservable, mergeObservable } from "./observable";

export type ConsoleApiName = "log" | "warn" | "error" | "info" | "debug";

export const CONSOLE_API_NAMES: {
  [key in ConsoleApiName]: key;
} = {
  log: "log",
  warn: "warn",
  error: "error",
  info: "info",
  debug: "debug",
};

export interface ConsoleLog {
  data: unknown[];
  api: ConsoleApiName;
}

export const createConsoleObservable = (api: ConsoleApiName) => {
  const observable = createObservable<ConsoleLog>(() => {
    const originalConsoleApi = console[api];
    console[api] = (...params: unknown[]) => {
      originalConsoleApi.apply(console, params);
      observable.notify({ api, data: params });
    };
    return () => {
      console[api] = originalConsoleApi;
    };
  });

  return observable;
};

export const initConsoleObservable = (apis: ConsoleApiName[]) => {
  const consoleObservables = apis.map((api) => {
    return createConsoleObservable(api);
  });
  return mergeObservable(...consoleObservables);
};
