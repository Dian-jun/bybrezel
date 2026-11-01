import { normalizeBase, validDay } from "./domain.js";
export function createBackend(config, sdk = globalThis.supabase) {
  const base = normalizeBase(config.basePath ?? "/thatday/");
  const configured = Boolean(
    config.supabaseUrl && config.supabasePublishableKey,
  );
  let client = null;
  if (configured) {
    const url = new URL(config.supabaseUrl);
    if (
      url.protocol !== "https:" &&
      !["localhost", "127.0.0.1"].includes(url.hostname)
    )
      throw Error("Supabase URL은 HTTPS여야 합니다.");
    if (config.supabasePublishableKey.startsWith("sb_secret_"))
      throw Error("브라우저에는 Publishable key만 사용해야 합니다.");
    // Legacy JWT anon keys are supported, but privileged JWTs are rejected.
    if (config.supabasePublishableKey.split(".").length === 3) {
      try {
        const p = JSON.parse(
          atob(
            config.supabasePublishableKey
              .split(".")[1]
              .replaceAll("-", "+")
              .replaceAll("_", "/"),
          ),
        );
        if (p.role && p.role !== "anon") throw Error("privileged key");
      } catch {
        throw Error("유효한 anon 또는 Publishable key가 필요합니다.");
      }
    }
    if (!sdk?.createClient) throw Error("Supabase SDK를 불러오지 못했습니다.");
    client = sdk.createClient(
      config.supabaseUrl,
      config.supabasePublishableKey,
      {
        auth: {
          flowType: "pkce",
          detectSessionInUrl: true,
          autoRefreshToken: true,
          persistSession: true,
          storageKey: "thatday:auth",
        },
      },
    );
  }
  const callback = () => new URL(base, location.origin).href;
  async function rpc(name, args = {}) {
    if (!client) throw Error("Supabase 연결 설정이 필요합니다.");
    const { data, error } = await client.rpc(`thatday_${name}`, args);
    if (error) throw Error(error.message);
    return data;
  }
  return {
    base,
    configured,
    client,
    rpc,
    async providers() {
      if (!client) return {};
      const response = await fetch(config.supabaseUrl + "/auth/v1/settings", {
        headers: { apikey: config.supabasePublishableKey },
      });
      if (!response.ok) throw Error("로그인 설정을 불러오지 못했습니다.");
      const data = await response.json();
      return {
        email: data.external?.email === true,
        google: data.external?.google === true,
        kakao: data.external?.kakao === true,
      };
    },
    async session() {
      if (!client) return null;
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session;
    },
    onAuth(callback) {
      return client?.auth.onAuthStateChange(callback).data.subscription;
    },
    async emailLogin(email) {
      if (!client) throw Error("Supabase 연결 설정이 필요합니다.");
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callback() },
      });
      if (error) throw error;
    },
    async oauth(provider) {
      if (!["google", "kakao"].includes(provider))
        throw Error("지원하지 않는 로그인입니다.");
      if (!client) throw Error("Supabase 연결 설정이 필요합니다.");
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callback() },
      });
      if (error) throw error;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },
    async timeline({
      date = "",
      q = "",
      category = "",
      offset = 0,
      ids = null,
      eventId = null,
    } = {}) {
      return rpc("timeline", {
        p_date: date,
        p_query: q,
        p_category: category,
        p_offset: offset,
        p_limit: 40,
        p_ids: ids,
        p_event_id: eventId,
      });
    },
    async records({
      own = false,
      date = "",
      q = "",
      category = "",
      offset = 0,
    } = {}) {
      return rpc(own ? "my_records" : "public_records", {
        p_date: date,
        p_query: q,
        p_category: category,
        p_offset: offset,
        p_limit: own ? 40 : 10,
      });
    },
  };
}
export function filterStarter(
  events,
  { date = "", q = "", category = "", ids = null, eventId = null } = {},
) {
  let start = date,
    end = date;
  if (date.length === 4) {
    start = `${date}-01-01`;
    end = `${date}-12-31`;
  } else if (date.length === 7) {
    start = `${date}-01`;
    end = new Date(
      Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 0),
    )
      .toISOString()
      .slice(0, 10);
  }
  if (date && (!validDay(start) || !validDay(end)))
    throw Error("날짜를 확인해 주세요.");
  return events.filter((e) => {
    if(!["verified","curated_sample"].includes(e.verification_status))return false;
    const eventEnd =
      e.date_end ??
      (e.date_precision === "year"
        ? `${e.date_start.slice(0, 4)}-12-31`
        : e.date_precision === "month"
          ? new Date(
              Date.UTC(
                Number(e.date_start.slice(0, 4)),
                Number(e.date_start.slice(5, 7)),
                0,
              ),
            )
              .toISOString()
              .slice(0, 10)
          : e.date_start);
    return (
      (!date || (e.date_start <= end && eventEnd >= start)) &&
      (!category || e.category === category) &&
      (!eventId || e.id === eventId) &&
      (ids === null || ids.includes(e.id)) &&
      (!q ||
        `${e.title} ${e.description} ${e.category} ${e.date_start} ${e.date_start.replaceAll("-", ".")}`
          .toLowerCase()
          .includes(q.toLowerCase()))
    );
  });
}
