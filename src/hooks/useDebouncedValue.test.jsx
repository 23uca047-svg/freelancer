import { renderHook, act } from "@testing-library/react";
import useDebouncedValue from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(({ value }) => useDebouncedValue(value, 250), {
      initialProps: { value: "hello" },
    });

    expect(result.current).toBe("hello");
  });

  it("updates only after delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: "first" },
    });

    rerender({ value: "second" });
    expect(result.current).toBe("first");

    act(() => {
      jest.advanceTimersByTime(199);
    });
    expect(result.current).toBe("first");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("second");
  });
});
