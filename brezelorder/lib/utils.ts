import { clsx } from "clsx";
import type { Locale } from "@/lib/i18n";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatEuro(amountCents: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(amountCents / 100);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatRelativeTime(date: string) {
  return new Intl.RelativeTimeFormat("de-DE", { numeric: "auto" }).format(
    Math.round((new Date(date).getTime() - Date.now()) / 60000),
    "minute"
  );
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function formatKoreanDate(date: string) {
  const parsed = new Date(date);
  return `${parsed.getFullYear()}년 ${parsed.getMonth() + 1}월 ${parsed.getDate()}일`;
}

export function formatKoreanDateTime(date: string) {
  const parsed = new Date(date);
  const hours = parsed.getHours();
  const meridiem = hours >= 12 ? "오후" : "오전";
  const hour12 = hours % 12 || 12;

  return `${parsed.getFullYear()}년 ${parsed.getMonth() + 1}월 ${parsed.getDate()}일 ${meridiem} ${pad2(hour12)}:${pad2(parsed.getMinutes())}`;
}

function getIntlLocale(locale: Locale) {
  switch (locale) {
    case "ko":
      return "ko-KR";
    case "en":
      return "en-US";
    default:
      return "de-DE";
  }
}

export function formatDateByLocale(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(date));
}

export function formatDateTimeByLocale(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export function formatTimeByLocale(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}
