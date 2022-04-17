# capture-console-log

```tsx
const logs: {
  api: ConsoleApiName;
  message: string;
}[] = [];

const buildNativeLikeConsoleMessage = (data: unknown[]) => {
  return data
    .map((param) => {
      if (param instanceof Error) {
        return param.stack;
      }
      if (typeof param === "function" || typeof param === "symbol") {
        return param.toString();
      }
      if (typeof param === "object") {
        return JSON.stringify(param);
      }
      if (typeof param === "bigint") {
        return `${param}n`;
      }
      return `${param}`;
    })
    .join(" ");
};

initConsoleObservable(["error"]).subscribe(({ api, data }) => {
  logs.push({
    api,
    message: buildNativeLikeConsoleMessage(data),
  });
});
```

```tsx
interface Log {
  api: ConsoleApiName;
  message: string;
}
const [logs, setLogs] = useState<Log[]>([]);
useEffect(() => {
  const consoleSubscription = initConsoleObservable(["error"]).subscribe(
    ({ api, data }) => {
      setLogs((prev) => {
        return [...prev, { api, message: buildNativeLikeConsoleMessage(data) }];
      });
    }
  );
  return () => {
    consoleSubscription.unsubscribe();
  };
}, []);
```
