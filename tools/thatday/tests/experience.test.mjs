import { test } from "node:test";
import assert from "node:assert/strict";
import {
  memoryYears,
  orderedRows,
  allPages,
  personalSentence,
} from "../../../thatday/experience.js";
import { chosenRecordContext } from "../../../thatday/record-input.js";
const event = {
  id: "worldcup",
  date_start: "2002-06-22",
  date_precision: "day",
  date_end: null,
};
test("year markers include remembered events beyond the currently visible page", () => {
  assert.deepEqual(
    [
      ...memoryYears(
        ["a", "b"],
        [
          { id: "a", date_start: "1997-01-01" },
          { id: "b", date_start: "2002-06-22" },
          { id: "c", date_start: "2020-01-01" },
        ],
      ),
    ],
    ["1997", "2002"],
  );
});
test("complete personal archive merges pages into one chronological sequence", async () => {
  const pages = {
    0: { events: [{ id: "a", date_start: "2002-06-22" }], next: 40 },
    40: { events: [{ id: "b", date_start: "2020-01-01" }], next: null },
  };
  const events = await allPages(async (o) => pages[o], "events");
  assert.deepEqual(
    orderedRows(events, [{ id: "r", date_start: "1997-12-03" }]).map(
      (r) => r.id,
    ),
    ["r", "a", "b"],
  );
  await assert.rejects(
    allPages(async () => ({ events: [], next: 0 }), "events"),
    /페이지/,
  );
  assert.equal(
    await allPages(
      async () => pages[0],
      "events",
      () => false,
    ),
    null,
  );
});
test("exact same-day story and event-related memory remain distinct; precision is explicit", () => {
  const unrelated = chosenRecordContext(event, null, null, {
    relation: "same_date",
    precision: "day",
  });
  assert.equal(unrelated.relation, "same_date");
  assert.equal(unrelated.date_start, "2002-06-22");
  assert.equal(unrelated.event_id, "worldcup");
  const around = chosenRecordContext(event, null, null, {
    precision: "around",
  });
  assert.equal(around.date_precision, "around");
  assert.equal(around.relation, "related");
  assert.equal(
    chosenRecordContext(event, null, null, { precision: "month" }).date_start,
    "2002-06-01",
  );
  assert.equal(
    chosenRecordContext(event, null, null, { precision: "year" }).date_start,
    "2002-01-01",
  );
  assert.throws(() =>
    chosenRecordContext(null, null, "2002-06-22", { precision: "around" }),
  );
  assert.throws(() =>
    chosenRecordContext({ ...event, date_precision: "year" }, null, null, {
      precision: "day",
    }),
  );
});
test("old uncertain records retain dates on relationship-only edits", () => {
  const record = {
    date_start: "2002-01-01",
    date_end: null,
    date_precision: "year",
    relation: "related",
    event_id: "worldcup",
  };
  assert.equal(
    chosenRecordContext(event, record, null, { relation: "same_date" })
      .date_start,
    "2002-01-01",
  );
  assert.equal(
    chosenRecordContext(event, record, null, { relation: "same_date" })
      .date_precision,
    "year",
  );
});
test("only nickname is emphasized; original text and HTML escaping are preserved", () => {
  assert.equal(
    personalSentence("다인", "가족들과 거리 응원을 했다.", "subject"),
    "<strong>@다인은</strong> 가족들과 거리 응원을 했다.",
  );
  assert.equal(
    personalSentence("민규", "ㄹㅇ 레전드 경기", "quote"),
    "<strong>@민규:</strong> ㄹㅇ 레전드 경기",
  );
  assert.ok(
    !personalSentence("<script>", "<img src=x>", "quote").includes("<script>"),
  );
});
