import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import * as domain from "../../../thatday/domain.js";
import * as context from "../../../thatday/record-input.js";
import * as lives from "../../../thatday/lives.js";
import * as experience from "../../../thatday/experience.js";
const read = (p) => readFile(new URL("../../../" + p, import.meta.url), "utf8");
const event = {
  id: "test-event",
  title: "테스트 사건",
  date_start: "2002-06-22",
  date_end: null,
  date_precision: "day",
  category: "스포츠",
  verification_status: "verified",
  sources: [],
};
async function harness() {
  const { JSDOM } = await import(process.env.THATDAY_JSDOM_MODULE);
  const dom = new JSDOM(await read("thatday/index.html"), {
    url: "https://example.test/thatday/?date=2002",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window;
  let remembered = [],
    records = [],
    failRemember = false,
    failSave = false,
    rememberCalls = 0,
    saveCalls = 0;
  const backend = {
    base: "/thatday/",
    configured: true,
    providers: async () => ({}),
    session: async () => ({ user: { id: "qa", is_anonymous: true } }),
    guest: async () => ({ user: { id: "qa" } }),
    onAuth: () => {},
    timeline: async (args = {}) => {
      const es = args.ids && !args.ids.includes(event.id) ? [] : [event];
      return { events: structuredClone(es), total: es.length, next: null };
    },
    records: async ({ own }) => ({
      records: own ? structuredClone(records) : [],
      next: null,
    }),
    rpc: async (name, args = {}) => {
      if (name === "me")
        return {
          user: { id: "qa", display_name: "다인", role: "user" },
          remembered: [...remembered],
          record_count: records.length,
        };
      if (name === "remember") {
        rememberCalls++;
        await new Promise((r) => setTimeout(r, 15));
        if (failRemember) throw Error("저장 실패");
        remembered = args.p_selected
          ? [...new Set([...remembered, ...args.p_ids])]
          : remembered.filter((id) => !args.p_ids.includes(id));
        return {};
      }
      if (name === "event_lives") {
        const filtered = records.filter((r) =>
          lives.matchesLife(r, event, args.p_group),
        );
        return {
          records: structuredClone(filtered),
          next: null,
          participants: remembered.length,
          same_day_available: true,
        };
      }
      if (name === "save_record") {
        saveCalls++;
        if (failSave) throw Error("네트워크 오류");
        const r = {
          ...args.p_record,
          id: args.p_id ?? "qa-record",
          display_name: "다인",
          is_own: true,
          moderation_status: "pending_review",
        };
        records = lives.mergeRecords(records, [r]);
        return {
          id: r.id,
          visibility: r.visibility,
          moderation_status: r.moderation_status,
        };
      }
      throw Error("Unexpected RPC " + name);
    },
  };
  Object.assign(w, {
    ...domain,
    h: domain.escapeHTML,
    ...context,
    ...lives,
    ...experience,
    createBackend: () => backend,
    filterStarter: () => [],
    fetch: async () => ({ ok: true, json: async () => [event] }),
    matchMedia: () => ({ matches: true }),
    scrollTo: () => {},
    confirm: () => true,
  });
  w.CSS = { escape: (s) => s };
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  let source = await read("thatday/app.js");
  source = source
    .replace(/^import[\s\S]*?from\s+["'][^"']+["'];\s*/gm, "")
    .replaceAll(
      "import.meta.url",
      JSON.stringify("https://example.test/thatday/app.js"),
    );
  vm.runInContext(source, dom.getInternalVMContext());
  const wait = async (predicate) => {
    for (let i = 0; i < 100; i++) {
      if (predicate()) return;
      await new Promise((r) => setTimeout(r, 5));
    }
    throw Error("DOM state timeout");
  };
  await wait(() => w.document.querySelector(".event-title"));
  const click = (selector) => {
    const el = w.document.querySelector(selector);
    assert.ok(el, selector);
    el.click();
  };
  return {
    w,
    dom,
    wait,
    click,
    backend,
    failMemory: () => {
      failRemember = true;
    },
    failSaving: (v) => {
      failSave = v;
    },
    calls: () => ({ rememberCalls, saveCalls }),
    records: () => records,
  };
}
test(
  "DOM: memory toggling rolls back failure, opens stories separately and preserves draft on failed save",
  { skip: !process.env.THATDAY_JSDOM_MODULE },
  async () => {
    const h = await harness();
    try {
      const { w, click, wait } = h,
        d = w.document;
      click("[data-remember]");
      assert.equal(
        d.querySelector("[data-remember]").getAttribute("aria-pressed"),
        "true",
      );
      click("[data-remember]");
      await wait(() => !d.querySelector("[data-remember]").disabled);
      assert.equal(h.calls().rememberCalls, 1);
      assert.ok(
        d.querySelector('[data-year="2002"]').classList.contains("has-memory"),
      );
      assert.equal(d.querySelector(".lives-panel").dataset.open, "false");
      click("[data-lives]");
      await wait(() =>
        d.querySelector(".lives-content").textContent.includes("아직 이 사건"),
      );
      assert.ok(
        d
          .querySelector(".lives-content")
          .textContent.includes("같은 날, 다른 이야기"),
      );
      h.failMemory();
      click("[data-remember]");
      await wait(() => !d.querySelector("[data-remember]").disabled);
      assert.equal(
        d.querySelector("[data-remember]").getAttribute("aria-pressed"),
        "true",
      );
      assert.ok(d.querySelector("#error").textContent.includes("저장 실패"));
      click("[data-write-event]");
      await wait(() => d.querySelector("#memory-text"));
      assert.equal(d.querySelector("#record-date"), null);
      assert.equal(
        d.querySelector('[name="visibility"]:checked').value,
        "private",
      );
      const text = d.querySelector("#memory-text");
      text.value = "ㄹㅇ 레전드 경기 <script>";
      text.dispatchEvent(new w.Event("input", { bubbles: true }));
      d.querySelector('[name="relation"]').value = "same_date";
      h.failSaving(true);
      d.querySelector("#record-form").dispatchEvent(
        new w.Event("submit", { bubbles: true, cancelable: true }),
      );
      await wait(() =>
        d.querySelector("#form-error").textContent.includes("네트워크"),
      );
      assert.equal(text.value, "ㄹㅇ 레전드 경기 <script>");
      assert.equal(d.querySelector("#sheet").open, true);
      h.failSaving(false);
      d.querySelector("#record-form").dispatchEvent(
        new w.Event("submit", { bubbles: true, cancelable: true }),
      );
      await wait(() => d.querySelector("#life-record-qa-record"));
      assert.equal(d.querySelector("#sheet").open, false);
      assert.equal(h.records()[0].relation, "same_date");
      assert.equal(h.records()[0].visibility, "private");
      assert.equal(h.records()[0].original_text, "ㄹㅇ 레전드 경기 <script>");
      assert.equal(d.querySelector("#life-record-qa-record script"), null);
      click('[data-nav="mine"]');
      await wait(() => d.querySelector("#record-qa-record"));
      assert.ok(d.querySelector("#event-test-event"));
      assert.equal(w.location.search.includes("date=2002"), true);
      assert.ok(
        d.querySelector("#record-qa-record").textContent.includes("나만 보기"),
      );
    } finally {
      h.dom.window.close();
    }
  },
);
