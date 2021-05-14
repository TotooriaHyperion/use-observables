// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="@types/jest" />

import { renderHook } from "@testing-library/react-hooks";

import { useObservables } from "../src";
import { BehaviorSubject, combineLatest, from, of, timer } from "rxjs";
import { delay, mapTo, share } from "rxjs/operators";
import { sleep, withAct } from "./shared";

test("useObservables", async () => {
  const obs1 = of(1);
  const obs2 = timer(100).pipe(mapTo(2), share());
  const obs3raw = new BehaviorSubject(3);
  const obs3 = obs3raw.pipe(share());
  const obs4 = from([2, 3, 4]).pipe(withAct, share());
  const obs5 = from(sleep(200).then(() => 5)).pipe(withAct, share());
  const obs6 = from([4, 5, 6]).pipe(delay(300), withAct, share());
  const observables = [...[obs1, obs2, obs3].map(withAct), obs4, obs5, obs6];
  let renderCount = 0;
  let values: any[] = [];
  renderHook(() => {
    renderCount++;
    const result = useObservables(...observables);
    values.push(result);
    return null;
  });
  const complete = combineLatest(observables);
  obs3raw.complete();

  await new Promise((resolve) => {
    complete.subscribe({
      complete: () => {
        resolve(1);
      },
    });
  });

  expect(values).toEqual([
    [1, undefined, 3, 4], // init
    [1, 2, 3, 4], // timer(100)
    [1, 2, 3, 4, 5], // from(promise(200))
    [1, 2, 3, 4, 5, 4], // delay(300).4
    [1, 2, 3, 4, 5, 5], // delay(300).5
    [1, 2, 3, 4, 5, 6], // delay(300).6
  ]);
});
