import { act } from '@testing-library/react-hooks';
import { Observable } from 'rxjs';

export const sleep = (time: number) => new Promise((rs) => setTimeout(rs, time));

export function withAct<T>(obs: Observable<T>): Observable<T> {
  return new Observable<T>((observer) => {
    obs.subscribe({
      next: (v) => act(() => observer.next(v)),
      error: (err) => act(() => observer.error(err)),
      complete: () => act(() => observer.complete()),
    });
  });
}
