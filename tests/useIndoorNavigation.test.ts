let hookState: unknown[] = [];
let hookCursor = 0;

const resetRenderCursor = () => {
  hookCursor = 0;
};

jest.mock(
  "react",
  () => ({
    useState: (initialValue: unknown) => {
      const slot = hookCursor;
      hookCursor += 1;

      if (hookState[slot] === undefined) {
        hookState[slot] = initialValue;
      }

      const setState = (nextValue: unknown) => {
        hookState[slot] =
          typeof nextValue === "function"
            ? (nextValue as (prev: unknown) => unknown)(hookState[slot])
            : nextValue;
      };

      return [hookState[slot], setState];
    },
  }),
  { virtual: true },
);

import { useIndoorNavigation } from "../app/frontend/src/features/map/hooks/useIndoorNavigation";

type NodeLike = {
  id: string;
  label: string;
};

const mockNodes: NodeLike[] = [
  { id: "n1", label: "Hall 920" },
  { id: "n2", label: "MB 1.210" },
  { id: "n3", label: "EV 1.605" },
];

const mockEdges: unknown[] = [];

const renderHook = (nodes: NodeLike[] = mockNodes) => {
  resetRenderCursor();
  return useIndoorNavigation(nodes as any, mockEdges as any);
};

describe("useIndoorNavigation", () => {
  beforeEach(() => {
    hookState = [];
    hookCursor = 0;
    jest.clearAllMocks();
  });

  it("filters start points by label", () => {
    let hook = renderHook();
    hook.handleStartSearch("mb");

    hook = renderHook();
    expect(hook.startPoint).toBe("mb");
    expect(hook.startResults).toHaveLength(1);
    expect(hook.startResults[0].label).toBe("MB 1.210");
  });

  it("selects a start node and clears start results", () => {
    let hook = renderHook();
    hook.handleStartSearch("hall");
    hook = renderHook();

    expect(hook.startResults).toHaveLength(1);
    hook.selectStartNode(hook.startResults[0]);

    hook = renderHook();
    expect(hook.startPoint).toBe("Hall 920");
    expect(hook.startResults).toEqual([]);
  });

  it("warns when navigation starts without both selected points", () => {
    const warnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const hook = renderHook();
    hook.handleStartNavigation();

    expect(warnSpy).toHaveBeenCalledWith("Select both points first");
    warnSpy.mockRestore();
  });

  /*it("logs navigation when both start and destination are selected", () => {
    const logSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    let hook = renderHook();
    hook.selectStartNode(mockNodes[0] as any);
    hook.selectDestinationNode(mockNodes[2] as any);

    hook = renderHook();
    hook.handleStartNavigation();

    expect(logSpy).toHaveBeenCalledWith("[NAV] Hall 920 → EV 1.605");
    logSpy.mockRestore();
  });
*/
  it("swaps start and destination points", () => {
    let hook = renderHook();
    hook.selectStartNode(mockNodes[0] as any);
    hook.selectDestinationNode(mockNodes[1] as any);

    hook = renderHook();
    expect(hook.startPoint).toBe("Hall 920");
    expect(hook.destinationPoint).toBe("MB 1.210");

    hook.swapPoints();
    hook = renderHook();

    expect(hook.startPoint).toBe("MB 1.210");
    expect(hook.destinationPoint).toBe("Hall 920");
    expect(hook.startResults).toEqual([]);
    expect(hook.destinationResults).toEqual([]);
  });
});
