import {
  categories,
  today,
  sentence,
  dateLabel,
  normalizeDate,
  validateDate,
  safetyFlags,
  escapeHTML as h,
  route,
} from "./domain.js";
import { lifeGroups, mergeRecords, matchesLife } from "./lives.js";
import { createBackend, filterStarter } from "./backend.js?v=20261101-device";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const backend = createBackend(
  window.THATDAY_CONFIG ?? { basePath: "/thatday/" },
);
const state = {
  guest: false,
  lives: new Map(),
  providers: null,
  view: "timeline",
  date: "",
  q: "",
  category: "",
  eventId: null,
  events: [],
  records: [],
  eventNext: null,
  recordNext: null,
  expanded: "",
  local: [],
  me: { user: null, remembered: [], record_count: 0 },
  starter: [],
  moderation: null,
};
let memoryQueue = Promise.resolve();
let deviceSetup = false,
  deviceRequest = null;
const memoryPending = new Set();
let generation = 0,
  authEpoch = 0,
  searchTimer,
  noticeTimer,
  previousFocus,
  previousScroll = 0,
  dirty = false,
  editor = null,
  pendingEditor = null;
const selected = () => (state.me.user ? state.me.remembered : state.local);
function notify(text, error = false) {
  const el = $(error ? "#error" : "#status");
  el.innerHTML = `<div class="toast ${error ? "error" : ""}"><span>${h(text)}</span><button aria-label="알림 닫기" data-action="dismiss" data-target="${error ? "error" : "status"}">×</button></div>`;
  if (!error) {
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => {
      el.replaceChildren();
    }, 7000);
  }
}
function readURL() {
  const p = new URLSearchParams(location.search);
  state.view = [
    "mine",
    "moderation",
    "privacy",
    "terms",
    "sources",
    "about",
  ].includes(p.get("view"))
    ? p.get("view")
    : "timeline";
  state.date = p.get("date") ?? "";
  state.q = (p.get("q") ?? "").slice(0, 100);
  state.category = categories.includes(p.get("category"))
    ? p.get("category")
    : "";
  state.eventId = p.get("event") || null;
  if (state.eventId) state.expanded = state.eventId;
}
function url() {
  return route(backend.base, {
    view: state.view === "timeline" ? "" : state.view,
    date: state.date,
    q: state.q,
    category: state.category,
    event: state.eventId,
  });
}
function navigate(values, { replace = false } = {}) {
  Object.assign(state, values);
  history[replace ? "replaceState" : "pushState"]({}, "", url());
  void load();
}
function heading() {
  const title =
    state.view === "mine"
      ? "나의 기록"
      : state.view === "moderation"
        ? "기록 검수"
        : state.view === "sources"
          ? "출처 확인"
          : state.view === "privacy"
            ? "개인정보 처리방침"
            : state.view === "terms"
              ? "함께 기록하기 위한 약속"
              : state.view === "about"
                ? "그날 우리는 소개"
                : "연대기";
  $("#page-heading").innerHTML = title;
  $(".page-title").classList.toggle("sr-only", state.view === "timeline");
  document.title = `${state.view === "mine" ? "나의 기록" : state.view === "moderation" ? "기록 검수" : "그날 우리는"} — 대한민국의 모든 날`;
  $("#section-label").textContent =
    state.view === "mine" ? "02 / PERSONAL ARCHIVE" : "01 / CHRONOLOGY";
  $$("[data-nav]").forEach((a) => {
    a.href = route(backend.base, {
      view: a.dataset.nav === "timeline" ? "" : a.dataset.nav,
    });
    if (a.dataset.nav === state.view) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $("#archive-count").textContent = String(selected().length || "");
  $("#memory-count").textContent = `내가 기억하는 사건 ${selected().length}개`;
  $("#account-button").textContent =
    `${state.me.user?.role === "moderator" ? "관리" : "기기 보관함"} ↗`;
  $("#moderation-link").hidden = state.me.user?.role !== "moderator";
  $("#year-select").value = state.date.slice(0, 4);
  document.body.dataset.view = state.view;
  $("#time-atlas").hidden = !["timeline", "mine"].includes(state.view);
  $("#atlas-year").innerHTML = state.date
    ? `${h(state.date.slice(0, 4))}<span>${h(state.date.length > 4 ? state.date.slice(5).replace("-", " / ") : "년의 기록")}</span>`
    : `1950<span>— ${today().slice(0, 4)}</span>`;
  $$("#year-index [data-year]").forEach((button) => {
    const active = button.dataset.year === state.date.slice(0, 4);
    button.setAttribute("aria-pressed", String(active));
    if (active) {
      const track = $("#year-index");
      track.scrollLeft =
        button.offsetLeft -
        track.offsetLeft -
        track.clientWidth / 2 +
        button.offsetWidth / 2;
    }
  });
  $("#month").value = state.date.length >= 7 ? state.date.slice(0, 7) : "";
  $("#day").value = state.date.length === 10 ? state.date : "";
  $("#query").value = state.q;
  $("#categories").innerHTML = ["", ...categories]
    .map(
      (c) =>
        `<button data-category="${h(c)}" class="${state.category === c ? "active" : ""}" aria-pressed="${state.category === c}">${h(c || "전체")}</button>`,
    )
    .join("");
  const n = $("#connection-notice");
  n.hidden = backend.configured && !(state.view === "mine" && !state.me.user);
  n.textContent = !backend.configured
    ? "Supabase 연결 전입니다. 역사 시작 자료를 읽고 이 기기에 기억을 표시할 수 있습니다. 로그인과 개인 기록 저장은 연결 후 사용할 수 있습니다."
    : "이 브라우저에 연결된 기록입니다. 브라우저 데이터를 지우거나 다른 기기를 사용하면 기존 기록에 접근할 수 없습니다.";
  const merge = $("#merge-notice");
  merge.hidden = !(state.me.user && state.local.length);
  merge.innerHTML = `이 기기에 ${state.local.length}개의 임시 기억이 있습니다. <button data-action="merge">계정에 합치기 ↗</button><button data-action="clear-local">기기 기억 비우기</button>`;
  $("#dataset-note").textContent = state.events.some(
    (e) => e.verification_status === "curated_sample",
  )
    ? "출처를 확인한 시작 자료를 열람 중입니다. 전체 역사 자료는 순차적으로 수록합니다."
    : "";
  let robots = $('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement("meta");
    robots.name = "robots";
    document.head.appendChild(robots);
  }
  robots.content = ["mine", "moderation"].includes(state.view)
    ? "noindex,nofollow"
    : "index,follow";
}
function eventHTML(e) {
  const remembered = selected().includes(e.id),
    open = state.expanded === e.id;
  return `<article class="event ${remembered ? "remembered" : ""}" id="event-${h(e.id)}"><div class="event-line"><button class="remember-button" data-remember="${h(e.id)}" aria-pressed="${remembered}" aria-label="${h(e.title)} ${remembered ? "기억 선택 해제" : "기억으로 선택"}"><span class="memory-dot"></span></button><time class="date mono" datetime="${h(e.date_start)}">${h(dateLabel(e.date_start, e.date_precision, e.date_end))}</time><button class="event-title" data-expand="${h(e.id)}" aria-expanded="${open}" aria-controls="detail-${h(e.id)}">${h(e.title)}</button><button class="expand-button" data-expand="${h(e.id)}" aria-label="사건 상세 정보" aria-expanded="${open}">${open ? "−" : "＋"}</button></div><div class="expand-grid" data-open="${open}" id="detail-${h(e.id)}" ${open ? "" : "inert"}><div><div class="event-detail"><span class="eyebrow">${h(e.category)}</span>${state.me.user?.birth_year && Number(e.date_start.slice(0, 4)) < state.me.user.birth_year ? `<p class="fine">출생 이전의 사건입니다. 직접 경험한 기억과 나중에 알게 된 역사를 구분해 남겨 주세요.</p>` : ""}${e.description ? `<p>${h(e.description)}</p>` : ""}<div class="event-actions"><button data-write-event="${h(e.id)}">＋ 내 이야기</button><a href="${h(route(backend.base, { event: e.id }))}">고유 링크 ↗</a><a href="${h(route(backend.base, { date: e.date_start }))}">그날의 기록</a></div></div></div></div><div class="life-invite" ${remembered ? "" : "hidden"}><button data-lives="${h(e.id)}" aria-expanded="${Boolean(state.lives.get(e.id)?.open)}" aria-controls="lives-${h(e.id)}">이날을 기억하는 다른 사람들의 이야기 보기 ↓</button></div><div class="lives-panel expand-grid" id="lives-${h(e.id)}" data-open="${Boolean(state.lives.get(e.id)?.open)}" ${state.lives.get(e.id)?.open ? "" : "inert"}><div><div class="lives-content">${livesHTML(e)}</div></div></div></article>`;
}
function livesHTML(event) {
  const data = state.lives.get(event.id);
  if (!data || data.loading)
    return '<p role="status">그날의 이야기를 불러오는 중입니다…</p>';
  if (data.error)
    return `<p role="alert">${h(data.error)}</p><button data-life-retry="${h(event.id)}">다시 불러오기</button>`;
  const groupHTML = (group) => {
    const page = data[group];
    const records = mergeRecords(
      page.records,
      data.justSaved && matchesLife(data.justSaved, event, group)
        ? [data.justSaved]
        : [],
    );
    const label =
      group === "related"
        ? "이 사건을 기억하는 사람들"
        : "같은 날, 다른 이야기";
    if (group === "same_day" && !data.sameDay)
      return '<p class="fine">날짜가 정확히 확인되지 않은 사건은 같은 날의 이야기를 묶지 않습니다.</p>';
    return `<section><h3>${label}</h3>${records.map((r) => `<div class="life-line" id="life-record-${h(r.id)}"><span aria-hidden="true">↳</span><div><p>${h(sentence(r.display_name, r.original_text, r.presentation_style))}</p><div class="record-meta"><span>${h(dateLabel(r.date_start, r.date_precision, r.date_end))}</span>${r.is_own ? `<span>${r.visibility === "private" ? "나만 보기" : r.moderation_status !== "published" ? "공개 검토 중 · 나에게만 표시" : "내 공개 기록"}</span><button data-life-edit="${h(r.id)}" data-event="${h(event.id)}">수정·공개 범위</button><button data-life-delete="${h(r.id)}" data-event="${h(event.id)}">삭제</button>` : `<button data-report="${h(r.id)}">신고</button>`}</div></div></div>`).join("") || `<p class="fine">${group === "related" ? "아직 이 사건에 남겨진 이야기가 없어요." : "아직 같은 날의 다른 이야기가 없어요."}</p>`}${page.next !== null ? `<button class="life-more" data-life-more="${h(event.id)}" data-group="${group}">다른 이야기 더 보기 ↓</button>` : ""}</section>`;
  };
  return `<div class="life-heading"><span>같은 날, 다른 인생</span><button data-lives="${h(event.id)}" aria-label="다른 사람들의 이야기 접기">접기 −</button></div><p class="fine">이 웹사이트에서 이 사건을 기억으로 선택한 참여자 ${data.participants}명</p>${lifeGroups.map(groupHTML).join("")}<div class="life-write"><p>당신은 그날 무엇을 하고 있었나요?</p><button data-write-event="${h(event.id)}">＋ ${data.related.records.length ? "내 이야기 남기기" : "첫 번째 이야기 남기기"}</button></div>`;
}
function paintLives(id) {
  const data = state.lives.get(id),
    event = state.events.find((e) => e.id === id);
  const panel = document.getElementById(`lives-${id}`);
  if (!event || !panel) return;
  panel.dataset.open = String(Boolean(data?.open));
  panel.inert = !data?.open;
  panel.querySelector(".lives-content").innerHTML = livesHTML(event);
  document.querySelectorAll("[data-lives]").forEach((b) => {
    if (b.dataset.lives === id)
      b.setAttribute("aria-expanded", String(Boolean(data?.open)));
  });
}
async function loadLives(id, { more = null, toggle = false } = {}) {
  const epoch = authEpoch;
  let data = state.lives.get(id);
  if (toggle && data?.open) {
    data.open = false;
    paintLives(id);
    return;
  }
  if (data?.busy) return;
  if (!data) {
    data = {
      open: true,
      related: { records: [], next: null },
      same_day: { records: [], next: null },
    };
    state.lives.set(id, data);
  }
  data.open = true;
  data.busy = true;
  data.loading = !more;
  data.error = null;
  if (!more) data.justSaved = null;
  paintLives(id);
  try {
    if (!backend.configured)
      throw Error("다른 사람의 이야기는 Supabase 연결 후 볼 수 있습니다.");
    for (const group of more ? [more] : lifeGroups) {
      const result = await backend.rpc("event_lives", {
        p_event_id: id,
        p_group: group,
        p_offset: more ? data[group].next : 0,
        p_limit: 5,
      });
      if (epoch !== authEpoch || state.lives.get(id) !== data) return;
      data[group] = {
        records: more
          ? mergeRecords(data[group].records, result.records)
          : result.records,
        next: result.next,
      };
      data.participants = result.participants;
      data.sameDay = result.same_day_available;
    }
  } catch (error) {
    data.error = "이야기를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  } finally {
    data.loading = false;
    data.busy = false;
    if (epoch === authEpoch) paintLives(id);
  }
}
function recordHTML(r) {
  const own = state.view === "mine";
  const status =
    r.visibility === "private"
      ? "나만 보기"
      : ({
          published: "모두에게 공개",
          pending_review: "공개 검수 중",
          hidden: "공개 숨김",
          rejected: "공개 거절",
        }[r.moderation_status] ?? "검수 중");
  return `<article class="personal-line" id="record-${h(r.id)}" aria-label="이용자가 남긴 개인의 기억. 독립적으로 검증되지 않았습니다."><span class="small-dot"></span><time class="date mono" datetime="${h(r.date_start)}">${h(dateLabel(r.date_start, r.date_precision, r.date_end))}</time><div><p>${h(sentence(r.display_name, r.original_text, r.presentation_style))}</p><div class="record-meta"><span>개인의 기억</span>${own ? `<span>${h(status)}</span><button data-edit="${h(r.id)}">수정·공개 범위</button><button data-delete="${h(r.id)}">삭제</button>` : `<button data-report="${h(r.id)}">신고</button>`}</div></div></article>`;
}
function renderLines() {
  const rows = [
    ...state.events.map((e) => ({
      kind: "event",
      date: e.date_start,
      id: e.id,
      item: e,
    })),
    ...state.records.map((r) => ({
      kind: "record",
      date: r.date_start,
      id: r.id,
      item: r,
    })),
  ].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.kind.localeCompare(b.kind) ||
      a.id.localeCompare(b.id),
  );
  let prev = "";
  $("#lines").innerHTML =
    rows
      .map((row) => {
        const y = row.date.slice(0, 4),
          start =
            y !== prev
              ? `<div class="year-heading"><h2>${y}</h2><span class="mono">${String(Number(y) - 1949).padStart(2, "0")} /</span></div>`
              : "";
        prev = y;
        return (
          start +
          (row.kind === "event" ? eventHTML(row.item) : recordHTML(row.item))
        );
      })
      .join("") ||
    `<div class="empty"><span class="mono">—</span><p>${state.view === "mine" ? "아직 기록된 기억이 없습니다." : "이 조건에 해당하는 기록은 아직 없습니다."}</p><p>빈 날짜에도, 누군가의 하루는 있었습니다.</p><button data-action="write">이날의 기록 남기기 ＋</button></div>`;
  $("#more-events").hidden = state.eventNext === null;
  $("#more-records").hidden = state.recordNext === null;
}
async function refreshMe() {
  const epoch = authEpoch;
  const me = backend.configured
    ? await backend.rpc("me")
    : { user: null, remembered: [], record_count: 0 };
  if (epoch !== authEpoch) return;
  const session = backend.configured ? await backend.session() : null;
  if (epoch !== authEpoch) return;
  state.guest = session?.user.is_anonymous === true;
  state.me = me;
  heading();
}
async function load() {
  const ticket = ++generation;
  heading();
  const legal = ["privacy", "terms", "sources", "about"].includes(state.view);
  $("#archive-content").hidden = legal || state.view === "moderation";
  $("#legal-content").hidden = !legal;
  $("#moderation-content").hidden = state.view !== "moderation";
  if (state.view === "about") {
    $("#legal-content").innerHTML =
      `<span class="eyebrow">공동의 연대기 / COLLECTIVE CHRONICLE</span><h2>대한민국의 모든 날,<br>그리고 그 안에 살았던 우리.</h2><p>역사의 한 줄 옆에, 당신의 한 줄을 남겨 주세요.<br>작고 평범한 하루도 우리 역사의 일부이니까요.</p>`;
    return;
  }
  if (state.view === "sources") {
    await renderSources(ticket);
    return;
  }
  if (legal) {
    renderLegal();
    return;
  }
  if (state.view === "moderation") {
    await loadModeration();
    return;
  }
  $("#loading").hidden = false;
  $("#lines").setAttribute("aria-busy", "true");
  const args = {
    date: state.date,
    q: state.q,
    category: state.category,
    ids: state.view === "mine" ? selected() : null,
    eventId: state.eventId,
  };
  try {
    const [events, records] = await Promise.all([
      backend.configured
        ? backend.timeline(args)
        : Promise.resolve({
            events: filterStarter(state.starter, args),
            next: null,
          }),
      backend.configured && (state.view !== "mine" || state.me.user)
        ? backend.records({ ...args, own: state.view === "mine" })
        : Promise.resolve({ records: [], next: null }),
    ]);
    if (ticket !== generation) return;
    state.events = events.events;
    state.eventNext = events.next;
    state.records = records.records;
    state.recordNext = records.next;
    heading();
    renderLines();
    if (state.expanded && state.events.some((e) => e.id === state.expanded))
      void loadLives(state.expanded);
  } catch (e) {
    if (ticket === generation) {
      state.events = [];
      state.records = [];
      renderLines();
      notify(e.message, true);
    }
  } finally {
    if (ticket === generation) {
      $("#loading").hidden = true;
      $("#lines").setAttribute("aria-busy", "false");
    }
  }
}
async function more(kind) {
  const ticket = generation;
  const button = $(kind === "events" ? "#more-events" : "#more-records");
  button.disabled = true;
  try {
    const args = { date: state.date, q: state.q, category: state.category };
    if (kind === "events") {
      const r = await backend.timeline({
        ...args,
        offset: state.eventNext,
        ids: state.view === "mine" ? selected() : null,
        eventId: state.eventId,
      });
      if (ticket !== generation) return;
      state.events.push(...r.events);
      state.eventNext = r.next;
    } else {
      const r = await backend.records({
        ...args,
        offset: state.recordNext,
        own: state.view === "mine",
      });
      if (ticket !== generation) return;
      state.records.push(...r.records);
      state.recordNext = r.next;
    }
    renderLines();
  } catch (e) {
    notify(e.message, true);
  } finally {
    button.disabled = false;
  }
}
function saveLocal(next) {
  state.local = next;
  try {
    localStorage.setItem("thatday:remembered", JSON.stringify(next));
  } catch {
    notify("이 브라우저에서는 임시 기억을 보관할 수 없습니다.", true);
  }
}
async function remember(id, button) {
  if (memoryPending.has(id)) return;
  if (state.me.user && !state.me.user.display_name) {
    openAccount();
    return;
  }
  const yes = !selected().includes(id),
    epoch = authEpoch;
  if (!state.me.user && yes && state.local.length >= 200) {
    notify("이 기기에는 최대 200개의 기억을 보관할 수 있습니다.", true);
    return;
  }
  const update = (value) => {
    const next = value
      ? [...new Set([...selected(), id])]
      : selected().filter((x) => x !== id);
    if (state.me.user) state.me.remembered = next;
    else saveLocal(next);
    const line = document.getElementById(`event-${id}`);
    if (line) {
      line.classList.toggle("remembered", value);
      line.querySelector(".life-invite").hidden = !value;
      const control = line.querySelector("[data-remember]");
      control.setAttribute("aria-pressed", String(value));
      control.setAttribute(
        "aria-label",
        `${state.events.find((e) => e.id === id)?.title} ${value ? "기억 선택 해제" : "기억으로 선택"}`,
      );
    }
    heading();
  };
  memoryPending.add(id);
  button.disabled = true;
  update(yes);
  try {
    if (state.me.user) {
      const job = memoryQueue
        .catch(() => {})
        .then(() => {
          if (epoch !== authEpoch) throw Error("로그인 상태가 바뀌었습니다.");
          return backend.rpc("remember", { p_ids: [id], p_selected: yes });
        });
      memoryQueue = job;
      await job;
    }
    if (epoch !== authEpoch) return;
    if (yes) {
      if (state.lives.get(id)?.open) void loadLives(id);
      notify(
        state.me.user
          ? "나의 기억에 보관했습니다."
          : "이 기기에 기억을 저장했습니다. 이야기를 남기면 같은 브라우저의 보관함에 함께 저장합니다.",
      );
    } else {
      notify("기억 선택을 해제했습니다.");
      if (state.view === "mine") await load();
    }
  } catch (error) {
    if (epoch === authEpoch) update(!yes);
    notify(error.message, true);
  } finally {
    memoryPending.delete(id);
    button.disabled = false;
  }
}
function openSheet(title, html) {
  if (!$("#sheet").open) {
    previousFocus = document.activeElement;
    previousScroll = scrollY;
    document.body.style.overflow = "hidden";
  }
  $("#sheet-title").textContent = title;
  $("#sheet-body").innerHTML = html;
  dirty = false;
  if (!$("#sheet").open) $("#sheet").showModal();
  $("#close-sheet").focus();
}
function closeSheet(force = false) {
  if (dirty && !force && !confirm("저장하지 않은 내용이 있습니다. 닫을까요?"))
    return false;
  $("#sheet").close();
  $("#sheet-body").replaceChildren();
  document.body.style.overflow = "";
  dirty = false;
  editor = null;
  if (!force) pendingEditor = null;
  previousFocus?.focus({ preventScroll: true });
  window.scrollTo(0, previousScroll);
  return true;
}
function setupNotice() {
  return `<p class="fine">Supabase 설정을 연결한 뒤 로그인을 사용할 수 있습니다.</p>`;
}
function openLogin() {
  openSheet(
    "당신의 기록을 보관하려면",
    `<div class="sheet-message"><p>이메일 또는 연결한 소셜 계정으로<br>당신의 한 줄을 남겨 주세요.</p>${backend.configured ? `<form id="email-login" class="record-form"><label for="login-email">이메일</label><input id="login-email" name="email" type="email" autocomplete="email" required maxlength="254"><button class="primary" type="submit">이메일로 로그인 링크 받기 ↗</button></form><p class="fine" id="login-status" role="status"></p><div class="account-actions"><button data-oauth="google" ${state.providers?.google ? "" : "disabled"}>${state.providers?.google ? "구글로 계속하기 ↗" : "구글 로그인 준비 중"}</button><button data-oauth="kakao" ${state.providers?.kakao ? "" : "disabled"}>${state.providers?.kakao ? "카카오로 계속하기 ↗" : "카카오 로그인 준비 중"}</button></div><p class="fine">로그인을 시작한 브라우저에서 이메일 링크를 열어 주세요.</p>` : setupNotice()}</div>`,
  );
}
function openAccount() {
  if (!state.me.user) {
    openSheet(
      "이 기기의 보관함",
      `<div class="sheet-message"><p>이야기는 로그인 없이 남길 수 있습니다.</p><p>나의 기록은 이 기기의 같은 브라우저에서 볼 수 있습니다. 쿠키·사이트 데이터를 지우면 기존 기록을 다시 열 수 없으니 중요한 기록은 내려받아 보관해 주세요.</p><button data-action="write">이야기 남기기 ＋</button></div>`,
    );
    return;
  }
  const u = state.me.user;
  openSheet(
    "이 기기의 보관함",
    `<form id="profile-form" class="record-form"><label for="display-name">표시 이름</label><input id="display-name" name="display_name" required maxlength="24" value="${h(u.display_name)}" placeholder="다인"><label for="birth-year">출생 연도 <span class="fine">선택 · 공개되지 않습니다</span></label><input id="birth-year" name="birth_year" type="number" min="1900" max="${today().slice(0, 4)}" value="${u.birth_year ?? ""}"><p class="fine">실명은 필요하지 않습니다. 이름을 바꾸면 공개 기록은 다시 검수를 받습니다.</p><button class="primary" type="submit">이름 저장 ✓</button><p class="form-error" id="form-error" role="alert"></p></form><div class="account-actions"><button data-action="export">나의 데이터 내려받기 ↓</button>${!state.guest ? `<button data-action="signout">로그아웃 ↗</button>` : `<p class="fine">이 기기의 같은 브라우저에 보관됩니다. 쿠키·사이트 데이터를 지우면 기록에 접근할 수 없습니다.</p>`}<details><summary class="danger">이 서비스의 계정 삭제</summary><p class="fine">이 서비스의 프로필과 기록을 영구 삭제합니다. 다른 서비스에서도 사용할 수 있는 Supabase 로그인 계정은 유지됩니다.</p><form id="delete-account"><label for="delete-confirm">‘내 계정 삭제’를 입력해 주세요</label><input id="delete-confirm" name="confirmation" required autocomplete="off"><button class="danger" type="submit">서비스 기록 영구 삭제</button></form></details></div>`,
  );
}
async function getEvent(id) {
  return (
    state.events.find((e) => e.id === id) ??
    (backend.configured
      ? (await backend.timeline({ eventId: id })).events[0]
      : state.starter.find((e) => e.id === id))
  );
}
async function ensureDevice() {
  if (state.me.user?.display_name) return;
  if (deviceRequest) return deviceRequest;
  deviceRequest = (async () => {
    // Check durable browser storage before creating an identity users could not recover.
    try {
      localStorage.setItem("thatday:storage-check", "1");
      localStorage.removeItem("thatday:storage-check");
    } catch {
      throw Error(
        "이 브라우저에서 저장소가 차단되어 있습니다. 사이트 데이터 저장을 허용해 주세요.",
      );
    }
    deviceSetup = true;
    try {
      await backend.guest();
      await refreshMe();
      if (!state.me.user?.display_name) {
        const name =
          "기록자" + crypto.randomUUID().replaceAll("-", "").slice(0, 6) + "님";
        await backend.rpc("save_profile", {
          p_display_name: name,
          p_birth_year: null,
        });
        await refreshMe();
      }
      if (state.local.length) {
        await backend.rpc("remember", { p_ids: state.local, p_selected: true });
        saveLocal([]);
        await refreshMe();
      }
      state.lives.clear();
    } finally {
      deviceSetup = false;
    }
  })().finally(() => {
    deviceRequest = null;
  });
  return deviceRequest;
}
async function openEditor(event = null, record = null) {
  pendingEditor = { event, record };
  const preparing = !state.me.user?.display_name;
  if (preparing)
    openSheet(
      "그날의 한 줄",
      '<p class="sheet-message" role="status">이 기기의 보관함을 준비하고 있습니다…</p>',
    );
  try {
    await ensureDevice();
  } catch (error) {
    if (preparing) closeSheet(true);
    notify(error.message, true);
    return;
  }
  const d =
    record?.date_start ??
    event?.date_start ??
    (state.date.length === 10 ? state.date : today());
  editor = { event, record };
  const precision =
    record?.date_precision ??
    (event
      ? event.date_precision === "range"
        ? "around"
        : event.date_precision
      : "day");
  openSheet(
    record ? "기록 다듬기" : "그날의 한 줄",
    `<form id="record-form" class="record-form"><p class="fine">로그인 없이 참여합니다. 나의 기록은 이 기기의 같은 브라우저에 보관됩니다.</p><label for="writer-name">표시 이름<input id="writer-name" name="display_name" required maxlength="24" value="${h(state.me.user.display_name)}"></label>${event ? `<div class="context-note"><span>이날의 역사</span><p>${h(dateLabel(event.date_start, event.date_precision, event.date_end))} · ${h(event.title)}</p><label for="relation" class="sr-only">사건과의 관계</label><select id="relation" name="relation"><option value="related" ${record?.relation === "related" ? "selected" : ""}>이 사건과 관련된 기억</option><option value="same_date" ${record?.relation === "same_date" ? "selected" : ""}>같은 날의 다른 개인적 사건</option></select></div>` : ""}<div class="form-pair"><label for="record-date">언제였나요<input id="record-date" name="date" required type="date" min="1950-01-01" max="${today()}" value="${h(d)}"></label><label for="precision">날짜의 정확도<select id="precision" name="precision">${[["day", "정확한 날짜"], ...(event ? [["around", "이 사건 무렵"]] : []), ["month", "월까지만 기억"], ["year", "연도만 기억"], ["range", "기간으로 기록"]].map(([v, l]) => `<option value="${v}" ${v === precision ? "selected" : ""}>${l}</option>`).join("")}</select></label></div><label for="record-end" id="end-label" ${precision === "range" ? "" : "hidden"}>종료 날짜<input id="record-end" name="date_end" type="date" min="${h(d)}" max="${today()}" value="${h(record?.date_end ?? "")}"></label><label class="text-label" for="memory-text">그날, 당신은 무엇을 했나요?<span id="text-count">0 / 280</span></label><textarea id="memory-text" name="original_text" required maxlength="280" rows="3" placeholder="가족들과 거리 응원을 했다.">${h(record?.original_text ?? "")}</textarea><p class="fine">입력한 문장을 그대로 보관합니다. 실명이나 다른 사람의 개인정보는 남기지 마세요.</p><fieldset class="style-choice"><legend>문장의 모양</legend><label><input type="radio" name="style" value="subject" ${(record?.presentation_style ?? "subject") === "subject" ? "checked" : ""}> 이름으로 시작</label><label><input type="radio" name="style" value="quote" ${record?.presentation_style === "quote" ? "checked" : ""}> 내 말 그대로</label></fieldset><div class="record-preview"><span class="eyebrow">저장될 기록 / 미리보기</span><p id="preview-date"></p><p id="preview-text"></p><span class="fine" id="preview-visibility"></span></div><fieldset class="visibility"><legend>누가 볼 수 있나요?</legend><label><input type="radio" name="visibility" value="private" ${(record?.visibility ?? "private") === "private" ? "checked" : ""}> 나만 보기 <span>나의 기록에만 보관</span></label><label><input type="radio" name="visibility" value="public" ${record?.visibility === "public" ? "checked" : ""}> 모두에게 공개 <span>검수 후 연대기에 수록</span></label></fieldset><div id="public-options" hidden><p class="fine">공개 정보: 표시 이름, 문장, 날짜·정확도, 연결한 사건. 출생 연도는 공개하지 않습니다. 공개 요청과 수정은 검수를 거칩니다.</p><p class="form-error" id="safety-warning"></p><label class="confirm-public"><input type="checkbox" name="public_confirmed"> 미리보기와 공개될 정보를 확인하고 공개를 요청합니다.</label></div><p class="form-error" id="form-error" role="alert"></p><button class="primary" id="save-record" type="submit">나만의 기록으로 저장</button></form>`,
  );
  editor = { event, record };
  setDateInputType();
  preview();
}
function setDateInputType() {
  const input = $("#record-date"),
    p = $("#precision").value;
  let value = input.value;
  const previous = input.dataset.fullDate ?? value;
  if (input.type === "number" && value) value = `${value}-01-01`;
  else if (input.type === "month" && value) value = `${value}-01`;
  input.dataset.fullDate = value || previous;
  input.type = p === "year" ? "number" : p === "month" ? "month" : "date";
  input.min = p === "year" ? "1950" : p === "month" ? "1950-01" : "1950-01-01";
  input.max =
    p === "year"
      ? today().slice(0, 4)
      : p === "month"
        ? today().slice(0, 7)
        : today();
  input.value =
    p === "year"
      ? value.slice(0, 4)
      : p === "month"
        ? value.slice(0, 7)
        : value;
  $("#end-label").hidden = p !== "range";
  $("#record-end").required = p === "range";
}
function formRecord() {
  const f = new FormData($("#record-form")),
    p = f.get("precision"),
    v = f.get("date"),
    date = normalizeDate(
      p === "year" ? `${v}-01-01` : p === "month" ? `${v}-01` : v,
      p,
    );
  return {
    date_start: date,
    date_end: p === "range" ? f.get("date_end") : null,
    date_precision: p,
    original_text: f.get("original_text"),
    presentation_style: f.get("style"),
    visibility: f.get("visibility"),
    relation: editor.event ? f.get("relation") : "same_date",
    event_id: editor.event?.id ?? null,
    public_confirmed: f.has("public_confirmed"),
  };
}
function preview() {
  const r = formRecord();
  $("#text-count").textContent = `${r.original_text.length} / 280`;
  $("#preview-date").textContent = dateLabel(
    r.date_start,
    r.date_precision,
    r.date_end,
  );
  $("#preview-text").textContent = sentence(
    $("#writer-name").value || state.me.user.display_name,
    r.original_text || "…",
    r.presentation_style,
  );
  $("#preview-visibility").textContent =
    r.visibility === "private"
      ? "나에게만 보이는 기록"
      : "표시 이름과 기록이 검수 후 모두에게 공개됩니다.";
  $("#public-options").hidden = r.visibility !== "public";
  const flags = safetyFlags(r.original_text);
  $("#safety-warning").textContent = flags.length
    ? `${flags.join(", ")} 감지. 공개 전 삭제하거나 나만 보기를 선택해 주세요. 자동 감지는 완전하지 않습니다.`
    : "";
  $("#save-record").textContent =
    r.visibility === "public" ? "저장하고 검수 요청" : "나만의 기록으로 저장";
  $("#save-record").disabled =
    !r.original_text.trim() ||
    (r.visibility === "public" && (!r.public_confirmed || flags.length > 0));
}
async function loadModeration() {
  try {
    if (!backend.configured || state.me.user?.role !== "moderator") {
      $("#moderation-content").textContent =
        "검수 권한이 필요합니다. 권한은 Supabase에서 확인합니다.";
      return;
    }
    state.moderation = await backend.rpc("moderation");
    const data = state.moderation;
    const buttons = (r, id) =>
      `<div class="event-actions">${[
        ["published", "승인·공개 유지"],
        ["rejected", "거절"],
        ["hidden", "숨김"],
      ]
        .map(
          ([a, label]) =>
            `<button data-moderate="${h(id)}" data-revision="${r.revision}" data-decision="${a}">${label}</button>`,
        )
        .join("")}</div>`;
    $("#moderation-content").innerHTML =
      `<h2>공개 검수 대기</h2>${data.pending.map((r) => `<article><p>${h(sentence(r.display_name, r.original_text, r.presentation_style))}</p><p class="fine">${h(dateLabel(r.date_start, r.date_precision, r.date_end))}</p>${buttons(r, r.id)}</article>`).join("") || "<p>검수 대기 기록이 없습니다.</p>"}<h2>접수된 신고</h2>${data.reports.map((r) => `<article><p>${h(r.reason)}</p><p>${h(sentence(r.display_name, r.original_text, r.presentation_style))}</p>${buttons(r, r.target_record_id)}</article>`).join("") || "<p>접수된 신고가 없습니다.</p>"}<h2>검수 이력</h2>${data.audit.map((a) => `<p class="fine">${h(a.created_at)} · ${h(a.action)} · ${h(a.reason)}</p>`).join("")}`;
  } catch (e) {
    notify(e.message, true);
  }
}
async function renderSources(ticket) {
  const container = $("#legal-content");
  container.innerHTML = '<p role="status">출처를 불러오는 중입니다.</p>';
  try {
    let events = [],
      offset = 0;
    if (backend.configured) {
      do {
        const page = await backend.timeline({ offset });
        if (ticket !== generation) return;
        events.push(...page.events);
        if (page.next === null || page.next === undefined) break;
        if (page.next <= offset)
          throw Error("출처 목록을 불러오지 못했습니다.");
        offset = page.next;
      } while (true);
    } else events = filterStarter(state.starter, {});
    if (ticket !== generation) return;
    container.innerHTML = `<p>수록된 역사 사건의 출처와 원문 기사입니다. 사건별로 날짜와 자료를 모았습니다.</p><p>사건 설명은 사실을 요약한 자체 작성 문장이며, 원문과 사진의 권리는 각 출처에 있습니다.</p>${
      events
        .map(
          (e) =>
            `<section class="source-entry"><h2>${h(dateLabel(e.date_start, e.date_precision, e.date_end))} · ${h(e.title)}</h2><div class="source-list">${
              (e.sources ?? [])
                .filter((s) => s.source_url.startsWith("https://"))
                .map(
                  (s) =>
                    `<a href="${h(s.source_url)}" target="_blank" rel="noreferrer">${h(s.publisher)} · ${h(s.source_title)} ↗</a>`,
                )
                .join("") || "<span>등록된 출처가 없습니다.</span>"
            }</div></section>`,
        )
        .join("") || "<p>등록된 역사 자료가 없습니다.</p>"
    }`;
  } catch (error) {
    if (ticket === generation)
      container.innerHTML = `<p role="alert">${h(error.message)} 페이지를 새로고침해 주세요.</p>`;
  }
}
function renderLegal() {
  const privacy = state.view === "privacy";
  $("#legal-content").innerHTML =
    `<p class="review-note">출시 전 법률 검토가 필요한 초안입니다. 운영자·연락처, 시행일, 보유 기간, 국외 이전과 이의 제기 절차를 확정해야 합니다.</p>${privacy ? `<h2>수집과 목적</h2><p>이메일 가입 없이 기기별 익명 세션으로 기록을 보관합니다. 기존 계정 로그인도 유지합니다. 서비스 프로필에는 표시 이름과 선택한 출생 연도를 저장하며, 기억 선택과 개인 기록을 보관합니다. 이메일과 출생 연도는 공개 기록에 포함하지 않습니다.</p><h2>공개 범위</h2><p>첫 기록은 나만 보기로 시작합니다. 공개를 요청하면 표시 이름, 원문, 날짜와 정확도, 연결한 사건이 검수 후 공개됩니다. 공개 기록은 제3자가 복사하거나 검색 엔진이 보관할 수 있습니다.</p><h2>저장과 권리</h2><p>데이터와 인증은 Supabase에서 처리합니다. 광고·방문 분석 도구는 사용하지 않습니다. 이 기기의 임시 기억과 기록 접근용 세션은 브라우저 저장소(localStorage)에 저장됩니다. 쿠키·사이트 데이터 삭제, 브라우저 변경 또는 기기 변경 시 기존 비공개 기록의 접근과 수정 권한을 복구할 수 없습니다. 이야기 본문과 공개·검수 상태는 Supabase에 저장합니다. 나의 기록에서 원문·공개 범위를 수정하거나 삭제할 수 있고, 계정 설정에서 JSON 내보내기와 이 서비스의 프로필·기록 삭제를 할 수 있습니다. 공용 로그인 계정 자체의 삭제는 운영자에게 별도로 요청해야 합니다.</p><h2>출시 전 확인</h2><p>운영자의 개인정보 문의처, 수탁·국외 이전 고지, 미성년자 정책, 보유·백업 삭제 기간과 권리 행사 절차를 기재해야 합니다.</p>` : `<h2>역사와 개인의 기억</h2><p>출처를 가진 역사 자료와 이용자의 개인적 기억은 구분됩니다. 검수 승인은 사실을 독립적으로 검증했다는 뜻이 아닙니다.</p><h2>당신의 문장</h2><p>기록의 권리는 작성자에게 있습니다. 공개를 선택하면 서비스 연대기에 표시 이름과 기록을 표시하는 데 동의합니다. 원문은 자동으로 고쳐 쓰지 않습니다. 사칭, 괴롭힘, 개인정보 노출, 명예훼손, 광고와 불법 콘텐츠를 남기지 마세요.</p><h2>공개와 검수</h2><p>모든 공개 요청은 검수를 받습니다. 대기·거절·숨김 기록은 공개 연대기에 포함되지 않습니다. 공개 기록과 이름을 수정하면 다시 검수합니다. 신고를 통해 검수를 요청할 수 있으며, 운영자는 사유를 남겨 공개를 제한할 수 있습니다.</p><h2>날짜와 삭제</h2><p>불확실한 기억은 월·연도·사건 무렵으로 남겨 주세요. 기록의 수정·삭제와 비공개 전환은 가능하지만, 외부에 이미 복사된 기록의 삭제까지 보장할 수 없습니다. 수록된 자료는 역사의 일부이며 빈 날짜가 사건이 없던 날을 뜻하지 않습니다.</p>`}`;
}
async function resumeEditor() {
  let resume;
  try {
    resume = JSON.parse(sessionStorage.getItem("thatday:resume") ?? "null");
    sessionStorage.removeItem("thatday:resume");
  } catch {}
  if (resume && state.me.user) {
    const e = resume.eventId ? await getEvent(resume.eventId) : null;
    await openEditor(e);
  }
}

// Delegation keeps generated manuscript lines keyboard-accessible without per-line listeners.
document.addEventListener("click", async (event) => {
  const b = event.target.closest("button,a");
  if (!b) return;
  try {
    if (b.dataset.nav) {
      event.preventDefault();
      navigate({
        view: b.dataset.nav,
        date: "",
        q: "",
        category: "",
        eventId: null,
      });
      return;
    }
    if ("category" in b.dataset) {
      navigate({ category: b.dataset.category });
      return;
    }
    if ("year" in b.dataset) {
      navigate({ date: b.dataset.year, eventId: null });
      return;
    }
    if (b.dataset.lives) {
      await loadLives(b.dataset.lives, { toggle: true });
      return;
    }
    if (b.dataset.lifeRetry) {
      await loadLives(b.dataset.lifeRetry);
      return;
    }
    if (b.dataset.lifeMore) {
      b.disabled = true;
      await loadLives(b.dataset.lifeMore, { more: b.dataset.group });
      return;
    }
    if (b.dataset.lifeEdit || b.dataset.lifeDelete) {
      const id = b.dataset.lifeEdit || b.dataset.lifeDelete;
      const data = state.lives.get(b.dataset.event);
      const record = [
        ...lifeGroups.flatMap((g) => data?.[g]?.records ?? []),
        ...(data?.justSaved ? [data.justSaved] : []),
      ].find((r) => r.id === id && r.is_own);
      if (!record) return;
      if (b.dataset.lifeEdit)
        await openEditor(
          record.event_id ? await getEvent(record.event_id) : null,
          record,
        );
      else if (confirm("이 기록을 영구 삭제할까요?")) {
        await backend.rpc("delete_record", { p_id: id });
        await refreshMe();
        await loadLives(b.dataset.event);
        await load();
      }
      return;
    }
    if (b.dataset.expand) {
      const id = b.dataset.expand;
      state.expanded = state.expanded === id ? "" : id;
      const article = document.getElementById(`event-${id}`),
        open = state.expanded === id;
      article.querySelector(".expand-grid").dataset.open = String(open);
      article.querySelector(".expand-grid").inert = !open;
      article
        .querySelectorAll("[data-expand]")
        .forEach((x) => x.setAttribute("aria-expanded", String(open)));
      article.querySelector(".expand-button").textContent = open ? "−" : "＋";
      if (open) void loadLives(id);
      return;
    }
    if (b.dataset.remember) {
      await remember(b.dataset.remember, b);
      return;
    }
    if (b.dataset.writeEvent) {
      await openEditor(await getEvent(b.dataset.writeEvent));
      return;
    }
    if (b.dataset.edit) {
      const r = state.records.find((r) => r.id === b.dataset.edit);
      await openEditor(r.event_id ? await getEvent(r.event_id) : null, r);
      return;
    }
    if (b.dataset.delete) {
      if (confirm("이 기록을 영구 삭제할까요?")) {
        await backend.rpc("delete_record", { p_id: b.dataset.delete });
        await refreshMe();
        await load();
        notify("기록을 삭제했습니다.");
      }
      return;
    }
    if (b.dataset.report) {
      if (!state.me.user) await ensureDevice();
      const reason = prompt(
        "신고 사유를 입력해 주세요: 괴롭힘, 사칭, 개인정보 노출, 명예훼손, 스팸, 불법 콘텐츠",
      );
      if (reason) {
        await backend.rpc("report", {
          p_record_id: b.dataset.report,
          p_reason: reason,
        });
        notify("신고를 접수했습니다. 검수자가 확인합니다.");
      }
      return;
    }
    if (b.dataset.oauth) {
      b.disabled = true;
      await backend.oauth(b.dataset.oauth);
      return;
    }
    if (b.dataset.moderate) {
      const reason = prompt(
        "검수 사유를 입력해 주세요. 감사 기록에 보관됩니다.",
      );
      if (reason) {
        await backend.rpc("moderate", {
          p_id: b.dataset.moderate,
          p_revision: Number(b.dataset.revision),
          p_action: b.dataset.decision,
          p_reason: reason,
        });
        await loadModeration();
      }
      return;
    }
    const action = b.dataset.action;
    if (action === "write") {
      await openEditor();
      return;
    }
    if (action === "account") {
      openAccount();
      return;
    }
    if (action === "search") {
      const open = $("#search-row").hidden;
      $("#search-row").hidden = !open;
      b.setAttribute("aria-expanded", String(open));
      if (open) $("#query").focus();
      return;
    }
    if (action === "clear-search") {
      $("#search-row").hidden = true;
      $('[data-action="search"]').setAttribute("aria-expanded", "false");
      navigate({ q: "" });
      return;
    }
    if (action === "dismiss") {
      $("#" + b.dataset.target).replaceChildren();
      return;
    }
    if (action === "merge") {
      if (!state.me.user.display_name) {
        openAccount();
        return;
      }
      b.disabled = true;
      await backend.rpc("remember", { p_ids: state.local, p_selected: true });
      saveLocal([]);
      await refreshMe();
      await load();
      notify("이 기기의 기억을 계정에 합쳤습니다.");
      return;
    }
    if (action === "clear-local") {
      saveLocal([]);
      await load();
      return;
    }
    if (action === "signout") {
      await backend.signOut();
      closeSheet(true);
      notify("로그아웃했습니다.");
      return;
    }
    if (action === "export") {
      const data = await backend.rpc("export");
      const object = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = object;
      a.download = "그날우리는-나의기록.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(object), 1000);
      return;
    }
  } catch (e) {
    notify(e.message, true);
    if (b.dataset.oauth) b.disabled = false;
  }
});
document.addEventListener("submit", async (event) => {
  const f = event.target;
  if (
    !["email-login", "profile-form", "record-form", "delete-account"].includes(
      f.id,
    )
  )
    return;
  event.preventDefault();
  const button = f.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    if (f.id === "email-login") {
      await backend.emailLogin(new FormData(f).get("email"));
      $("#login-status").textContent =
        "로그인 링크를 요청했습니다. 받은편지함과 스팸함을 확인해 주세요.";
      return;
    }
    if (f.id === "profile-form") {
      const d = new FormData(f);
      await backend.rpc("save_profile", {
        p_display_name: d.get("display_name"),
        p_birth_year: d.get("birth_year") ? Number(d.get("birth_year")) : null,
      });
      await refreshMe();
      const next = pendingEditor;
      pendingEditor = null;
      closeSheet(true);
      await load();
      if (next) await openEditor(next.event, next.record);
      notify("표시 이름을 저장했습니다.");
      return;
    }
    if (f.id === "record-form") {
      const name = $("#writer-name").value.trim();
      if (name !== state.me.user.display_name) {
        await backend.rpc("save_profile", {
          p_display_name: name,
          p_birth_year: state.me.user.birth_year ?? null,
        });
        await refreshMe();
      }
      const r = formRecord();
      validateDate(r.date_start, r.date_precision, r.date_end, r.event_id);
      const result = await backend.rpc("save_record", {
        p_record: r,
        p_id: editor.record?.id ?? null,
      });
      const eventId = editor.event?.id;
      const scroll = previousScroll;
      closeSheet(true);
      pendingEditor = null;
      await refreshMe();
      await load();
      if (eventId) {
        await loadLives(eventId);
        const data = state.lives.get(eventId);
        if (data) {
          data.justSaved = {
            ...r,
            ...result,
            display_name: state.me.user.display_name,
            is_own: true,
          };
          paintLives(eventId);
        }
      }
      window.scrollTo(0, scroll);
      const line =
        document.getElementById(`life-record-${result.id}`) ??
        document.getElementById(`record-${result.id}`);
      if (line) {
        line.classList.add("inserted");
        setTimeout(() => line.classList.remove("inserted"), 3500);
      }
      notify(
        result.visibility === "private"
          ? "나의 연대기에 기록되었습니다."
          : result.moderation_status === "published"
            ? "당신의 이야기가 이 날짜에 더해졌습니다."
            : "기록이 저장되었고 공개 검토를 기다리고 있습니다.",
      );
      return;
    }
    if (f.id === "delete-account") {
      await backend.rpc("delete_account", {
        p_confirmation: new FormData(f).get("confirmation"),
      });
      closeSheet(true);
      await backend.signOut();
      notify(
        "이 서비스의 프로필과 기록을 삭제했습니다. 로그인 제공자의 계정은 유지됩니다.",
      );
    }
  } catch (e) {
    const el = $("#form-error");
    if (el) el.textContent = e.message;
    else notify(e.message, true);
  } finally {
    if (button.isConnected) {
      button.disabled = false;
      if (f.id === "record-form") preview();
    }
  }
});
$("#sheet-body").addEventListener("input", (e) => {
  if (e.target.closest("#record-form")) {
    dirty = true;
    if (e.target.name !== "public_confirmed") {
      const cb = $('[name="public_confirmed"]');
      cb.checked = false;
    }
    preview();
  } else if (e.target.closest("#profile-form")) dirty = true;
});
$("#sheet-body").addEventListener("change", (e) => {
  if (e.target.id === "precision") {
    setDateInputType();
    preview();
  }
  if (e.target.closest("#record-form")) {
    dirty = true;
    preview();
  }
});
$("#close-sheet").addEventListener("click", () => closeSheet());
$("#sheet").addEventListener("cancel", (e) => {
  e.preventDefault();
  closeSheet();
});
$("#sheet").addEventListener("click", (e) => {
  if (e.target === $("#sheet")) closeSheet();
});
window.addEventListener("beforeunload", (e) => {
  if (dirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});
window.addEventListener("popstate", () => {
  if ($("#sheet").open && !closeSheet()) return;
  readURL();
  void load();
});
$("#year-select").addEventListener("change", (e) =>
  navigate({ date: e.target.value, eventId: null }),
);
$("#month").addEventListener("change", (e) =>
  navigate({ date: e.target.value, eventId: null }),
);
$("#day").addEventListener("change", (e) =>
  navigate({ date: e.target.value, eventId: null }),
);
$("#query").addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(
    () => navigate({ q: e.target.value }, { replace: true }),
    250,
  );
});
$("#more-events").addEventListener("click", () => more("events"));
$("#more-records").addEventListener("click", () => more("records"));
async function start() {
  const year = Number(today().slice(0, 4));
  $$("[data-years]").forEach((el) => (el.textContent = `1950—${year}`));
  $("#year-select").insertAdjacentHTML(
    "beforeend",
    Array.from(
      { length: year - 1949 },
      (_, i) => `<option>${year - i}</option>`,
    ).join(""),
  );
  $("#month").max = today().slice(0, 7);
  $("#day").max = today();
  $("#year-index").innerHTML = Array.from(
    { length: year - 1949 },
    (_, i) => 1950 + i,
  )
    .map(
      (y) =>
        `<button data-year="${y}" class="year-tick ${y % 10 === 0 || y === year ? "major" : ""}" aria-label="${y}년 기록" aria-pressed="false"><span>${y % 10 === 0 || y === year ? y : String(y).slice(2)}</span></button>`,
    )
    .join("");
  try {
    const v = JSON.parse(localStorage.getItem("thatday:remembered") ?? "[]");
    state.local = Array.isArray(v)
      ? v.filter((x) => typeof x === "string").slice(0, 200)
      : [];
  } catch {}
  readURL();
  try {
    const res = await fetch(new URL("./data/events.json", import.meta.url));
    if (!res.ok) throw Error("시작 자료를 불러오지 못했습니다.");
    state.starter = await res.json();
    if (backend.configured) {
      await backend.session();
      try {
        state.providers = await backend.providers();
      } catch (error) {
        notify(error.message, true);
      }
      const p = new URLSearchParams(location.search),
        err = p.get("error_description");
      if (err) notify(err, true);
      for (const key of ["code", "error", "error_description", "error_code"])
        p.delete(key);
      history.replaceState({}, "", location.pathname + (p.size ? "?" + p : ""));
      backend.onAuth((event, session) => {
        if (deviceSetup) return;
        if (
          event === "INITIAL_SESSION" ||
          (session?.user.id === state.me.user?.id && event !== "USER_UPDATED")
        )
          return;
        authEpoch++;
        state.lives.clear();
        $$(".lives-content").forEach((el) => el.replaceChildren());
        generation++;
        state.me = { user: null, remembered: [], record_count: 0 };
        state.records = [];
        heading();
        renderLines();
        setTimeout(async () => {
          try {
            if (session) await refreshMe();
            await load();
            if (session && event === "SIGNED_IN") await resumeEditor();
          } catch (e) {
            notify(e.message, true);
          }
        }, 0);
      });
      await refreshMe();
    }
    await load();
    await resumeEditor();
  } catch (e) {
    notify(e.message, true);
  }
}
void start();

if (window.visualViewport) {
  const fitSheet = () => {
    const viewport = window.visualViewport;
    $("#sheet").style.maxHeight = `${viewport.height * 0.94}px`;
  };
  window.visualViewport.addEventListener("resize", fitSheet);
  fitSheet();
}
