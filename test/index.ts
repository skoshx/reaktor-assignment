import test from "ava";

import { parseJSON } from "../src/util";

// An example unit test
test("parseJSON function works", function (t) {
  const f = parseJSON("invalid json");
  const s = parseJSON('{"pizza": 0}');
  t.is(f, null);
  t.deepEqual(s, { pizza: 0 });
});
