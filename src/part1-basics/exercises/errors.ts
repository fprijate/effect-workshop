import { Effect, Option, ReadonlyArray } from "effect";
import * as T from "../../testDriver";

// Exercise 1
// Come up with a way to run this effect until it succeeds, no matter how many times it fails

let i = 0;
const eventuallySuceeds = Effect.suspend(() =>
  i++ < 100 ? Effect.fail("error") : Effect.succeed(5)
);

const testOne = eventuallySuceeds;

T.testRunAssert(testOne, { success: 5 });

// Exercise 2
// Instead of short circuiting on the first error, collect all errors and fail with an array of them

let j = 0;
const maybeFail = Effect.suspend(() =>
  j++ % 2 === 0 ? Effect.fail(`odd ${j}`) : Effect.succeed(j)
);
const maybeFailArr = new Array(10).fill(0).map(() => maybeFail);

// const testTwo = Effect.all(maybeFailArr);

const testTwo = Effect.all(maybeFailArr, {
  mode: "validate",
}).pipe(
  Effect.mapError((errors) => errors.filter(Option.isSome).map((_) => _.value))
);

T.testRunAssert(testTwo, {
  failure: ["odd 1", "odd 3", "odd 5", "odd 7", "odd 9"],
});

// Exercise 3
// Now succeed with both a array of success values and an array of errors

const testThree = Effect.all(maybeFailArr);

T.testRunAssert(testThree, {
  success: {
    success: [2, 4, 6, 8, 10],
    failure: [1, 3, 5, 7, 9],
  },
});