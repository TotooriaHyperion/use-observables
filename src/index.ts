import { useDebugValue, useMemo } from "react";
import { from, ObservableInput, Subscription as RxSubscription } from "rxjs";
import { Subscription, useSubscription } from "use-subscription";

export function useObservables<T extends [...ObservableInput<any>[]]>(
  ...obs: T
): {
  [key in keyof T]: T[key] extends ObservableInput<infer V>
    ? V | undefined
    : never;
} {
  const subscription = useMemo<Subscription<any>>(() => {
    let dirty = false;
    const value: any = [];
    let result: any = [];
    let update: (() => void) | null = null;
    let sub: RxSubscription | null = null;
    let activated = false;

    const bootstrap = () => {
      // 执行订阅
      if (!sub) {
        sub = new RxSubscription();
        obs.forEach((ob, idx) => {
          sub!.add(
            from(ob).subscribe((v) => {
              if (v !== value[idx]) {
                value[idx] = v;
                // mark dirty
                dirty = true;
                // trigger update
                update?.();
              }
            }),
          );
        });
      }
    };

    const tryActivate = () => {
      // 激活订阅
      // 为什么？因为我们不希望在 getCurrentValue 里 subscribe().unsubscribe()
      // 因为他们会影响 rxjs observables 的 connect 行为
      // 而 use-subscription 在订阅之前就会执行 getCurrentValue 来获取当前值
      // 因此 getCurrentValue 也需要触发订阅，但在整个过程中，只应该进行1次订阅和1次解除订阅
      // 因此提取出 tryActivate 来确保 getCurrentValue 和 subscribe 都会激活，但订阅只执行一次
      if (!activated) {
        activated = true;
        bootstrap();
      }
    };

    const cleanUp = () => {
      // 解除订阅
      sub?.unsubscribe();
      sub = null;
      update = null;
      activated = false;
    };

    return {
      subscribe: (cb) => {
        tryActivate();
        update = cb;
        return cleanUp;
      },
      getCurrentValue: () => {
        tryActivate();
        if (dirty) {
          // for immutability
          result = [...value];
          dirty = false;
        }
        return result;
      },
    };
  }, obs);
  const result = useSubscription(subscription);
  useDebugValue(result);
  return result;
}
