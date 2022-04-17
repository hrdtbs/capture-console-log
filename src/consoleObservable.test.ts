import { CONSOLE_API_NAMES, initConsoleObservable } from "./consoleObservable";
import { Subscription } from "./observable";

[
  { api: CONSOLE_API_NAMES.log },
  { api: CONSOLE_API_NAMES.debug },
  { api: CONSOLE_API_NAMES.error },
  { api: CONSOLE_API_NAMES.info },
  { api: CONSOLE_API_NAMES.warn },
].forEach(({ api }) => {
  describe(`console ${api} observable`, () => {
    let consoleSubscription: Subscription;
    //const logs: ConsoleLog[] = [];
    let notifyLog: jest.Mock;
    let consoleStub: jest.SpyInstance;

    beforeEach(() => {
      consoleStub = jest.spyOn(global.console, api).mockImplementation();
      notifyLog = jest.fn();
      consoleSubscription = initConsoleObservable([api]).subscribe(notifyLog);
    });

    afterEach(() => {
      consoleSubscription.unsubscribe();
    });

    it(`should notify ${api}`, () => {
      console[api]("foo", "bar");
      const consoleLog = notifyLog.mock.calls[0][0];
      expect(consoleLog).toStrictEqual({
        api,
        data: ["foo", "bar"],
      });
    });

    it("should keep original behavior", () => {
      console[api]("foo", "bar");
      expect(consoleStub).toHaveBeenCalledWith("foo", "bar");
    });

    it("should allow multiple callers", () => {
      const notifyOtherCaller = jest.fn();
      const otherConsoleSubscription = initConsoleObservable([api]).subscribe(
        notifyOtherCaller
      );

      console[api]("foo", "bar");

      expect(notifyLog).toHaveBeenCalledTimes(1);
      expect(notifyOtherCaller).toHaveBeenCalledTimes(1);

      otherConsoleSubscription.unsubscribe();
    });
  });
});
