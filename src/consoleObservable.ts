import { createObservable, mergeObservable } from "./observable";

type ConsoleApiName = "log" | "warn" | "error" | "info" | "debug";

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
  stack?: string;
}

export const createConsoleObservable = (api: ConsoleApiName) => {
  const observable = createObservable<ConsoleLog>(() => {
    const originalConsoleApi = console[api];
    console[api] = (...params: unknown[]) => {
      originalConsoleApi.apply(console, params);
      observable.notify(buildConsoleLog(params, api));
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

const buildConsoleLog = (
  params: unknown[],
  api: ConsoleApiName
): ConsoleLog => {
  let stack;
  if (api === CONSOLE_API_NAMES.error) {
    const firstError = params.find(
      (param): param is Error => param instanceof Error
    );
    stack = firstError?.stack;
  }
  return {
    api,
    data: params,
    stack,
  };
};
