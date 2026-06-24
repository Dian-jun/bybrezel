"use client";

import { useMemo, useRef, useState } from "react";
import { RotateCw, Upload } from "lucide-react";

import { saveRestaurantFloorplanAction, saveTableLayoutsAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LayoutTable = {
  id: string;
  name: string;
  pos_x: number;
  pos_y: number;
  pos_w: number;
  pos_h: number;
  pos_rotation: number;
};

type Props = {
  locale: Locale;
  tables: LayoutTable[];
  floorplanImageUrl?: string | null;
};

const GRID = 56;
const MIN_W = 2;
const MIN_H = 2;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function intersects(a: LayoutTable, b: LayoutTable) {
  return !(
    a.pos_x + a.pos_w <= b.pos_x ||
    b.pos_x + b.pos_w <= a.pos_x ||
    a.pos_y + a.pos_h <= b.pos_y ||
    b.pos_y + b.pos_h <= a.pos_y
  );
}

function hasCollision(items: LayoutTable[], targetId: string, candidate: LayoutTable) {
  return items.some((item) => item.id !== targetId && intersects(candidate, item));
}

function findNearestFreePlacement(
  items: LayoutTable[],
  targetId: string,
  desired: LayoutTable,
  bounds: { width: number; height: number }
) {
  const startX = clamp(desired.pos_x, 0, Math.max(0, bounds.width - desired.pos_w));
  const startY = clamp(desired.pos_y, 0, Math.max(0, bounds.height - desired.pos_h));
  const maxRadius = Math.max(bounds.width, bounds.height);

  for (let radius = 0; radius <= maxRadius; radius += 1) {
    for (let y = startY - radius; y <= startY + radius; y += 1) {
      for (let x = startX - radius; x <= startX + radius; x += 1) {
        const candidate = {
          ...desired,
          pos_x: clamp(x, 0, Math.max(0, bounds.width - desired.pos_w)),
          pos_y: clamp(y, 0, Math.max(0, bounds.height - desired.pos_h))
        };

        if (!hasCollision(items, targetId, candidate)) {
          return candidate;
        }
      }
    }
  }

  return desired;
}

export function TableLayoutEditor({ locale, tables, floorplanImageUrl }: Props) {
  const [items, setItems] = useState(tables);
  const [selectedId, setSelectedId] = useState<string | null>(tables[0]?.id ?? null);
  const dragRef = useRef<{
    id: string;
    mode: "move" | "resize";
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    originW: number;
    originH: number;
  } | null>(null);

  const bounds = useMemo(() => {
    const width = Math.max(14, ...items.map((item) => item.pos_x + item.pos_w + 2));
    const height = Math.max(10, ...items.map((item) => item.pos_y + item.pos_h + 2));
    return { width, height };
  }, [items]);

  function startDrag(
    event: React.PointerEvent<HTMLElement>,
    id: string,
    mode: "move" | "resize"
  ) {
    const current = items.find((item) => item.id === id);
    if (!current) return;

    dragRef.current = {
      id,
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: current.pos_x,
      originY: current.pos_y,
      originW: current.pos_w,
      originH: current.pos_h
    };

    setSelectedId(id);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = Math.round((event.clientX - drag.startX) / GRID);
    const dy = Math.round((event.clientY - drag.startY) / GRID);

    setItems((current) =>
      current.map((item) => {
        if (item.id !== drag.id) return item;

        if (drag.mode === "move") {
          const desired = {
            ...item,
            pos_x: clamp(drag.originX + dx, 0, Math.max(0, bounds.width - item.pos_w)),
            pos_y: clamp(drag.originY + dy, 0, Math.max(0, bounds.height - item.pos_h))
          };

          return findNearestFreePlacement(current, drag.id, desired, bounds);
        }

        const desired = {
          ...item,
          pos_w: clamp(drag.originW + dx, MIN_W, Math.max(MIN_W, bounds.width - item.pos_x)),
          pos_h: clamp(drag.originH + dy, MIN_H, Math.max(MIN_H, bounds.height - item.pos_y))
        };

        if (hasCollision(current, drag.id, desired)) {
          return item;
        }

        return desired;
      })
    );
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
  }

  const selected = items.find((item) => item.id === selectedId) ?? null;
  const layoutsJson = JSON.stringify(items);

  function rotateSelected() {
    if (!selected) return;

    setItems((current) =>
      current.map((item) => {
        if (item.id !== selected.id) return item;

        const desired = {
          ...item,
          pos_w: item.pos_h,
          pos_h: item.pos_w,
          pos_rotation: item.pos_rotation === 90 ? 0 : 90
        };

        return findNearestFreePlacement(current, item.id, desired, bounds);
      })
    );
  }

  return (
    <section className="surface p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {locale === "ko" ? "POS 테이블 배치" : locale === "en" ? "POS table layout" : "POS Tischlayout"}
          </h2>
          <p className="mt-1.5 text-sm text-stone-500">
            {locale === "ko"
              ? "테이블을 클릭한 뒤 드래그해서 이동하고, 우하단 핸들로 크기를 조절하세요."
              : locale === "en"
                ? "Click a table, drag to move it, and resize it from the lower-right handle."
              : "Tische anklicken, verschieben und unten rechts in der Größe anpassen."}
          </p>
        </div>

        <form action={saveTableLayoutsAction}>
          <input type="hidden" name="layoutsJson" value={layoutsJson} />
          <Button type="submit">
            {locale === "ko" ? "레이아웃 저장" : locale === "en" ? "Save layout" : "Layout speichern"}
          </Button>
        </form>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-[2rem] border border-line/70 bg-[#1e293b] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.18)]">
          <div
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="relative overflow-hidden rounded-[1.5rem] bg-[#334155]"
            style={{
              width: "100%",
              minHeight: `${bounds.height * GRID}px`,
              backgroundImage: floorplanImageUrl
                ? `linear-gradient(rgba(15,23,42,0.34), rgba(15,23,42,0.38)), url(${floorplanImageUrl})`
                : "linear-gradient(180deg, rgba(241,245,249,0.06), rgba(15,23,42,0.04)), radial-gradient(circle at top left, rgba(251,191,36,0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(56,189,248,0.08), transparent 32%)",
              backgroundSize: floorplanImageUrl ? "cover" : undefined,
              backgroundPosition: "center"
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: `${GRID}px ${GRID}px`
              }}
            />
            {items.map((table) => {
              const isSelected = table.id === selectedId;

              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => setSelectedId(table.id)}
                  onPointerDown={(event) => startDrag(event, table.id, "move")}
                  className={cn(
                    "absolute rounded-[1.15rem] border px-3 py-2 text-left text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] transition",
                    isSelected
                      ? "border-amber-300 bg-[#475569] ring-2 ring-amber-300/70"
                      : "border-sky-300/80 bg-[#4b5563]"
                  )}
                  style={{
                    left: table.pos_x * GRID,
                    top: table.pos_y * GRID,
                    width: table.pos_w * GRID,
                    height: table.pos_h * GRID
                  }}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold">{table.name}</p>
                      <p className="mt-1 text-xs text-white/70">
                        {locale === "ko" ? "드래그로 이동" : locale === "en" ? "Drag to move" : "Drag to move"}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-white/65">
                        {table.pos_rotation === 90
                          ? locale === "ko"
                            ? "세로"
                            : locale === "en"
                              ? "Vertical"
                            : "Vertikal"
                          : locale === "ko"
                            ? "가로"
                            : locale === "en"
                              ? "Horizontal"
                            : "Horizontal"}
                      </span>
                      <span
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          startDrag(event, table.id, "resize");
                        }}
                        className="block h-5 w-5 cursor-se-resize rounded-full border border-white/30 bg-white/15"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-line/70 bg-[var(--surface-bg)] p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          {selected ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                {locale === "ko" ? "선택한 테이블" : locale === "en" ? "Selected table" : "Ausgewählter Tisch"}
              </p>
              <h3 className="text-xl font-semibold text-ink">{selected.name}</h3>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={rotateSelected}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  {locale === "ko" ? "회전" : locale === "en" ? "Rotate" : "Drehen"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-stone-600">
                <div className="theme-field rounded-2xl border px-4 py-3">
                  <p className="text-xs text-stone-400">X</p>
                  <p className="mt-1 font-semibold text-ink">{selected.pos_x}</p>
                </div>
                <div className="theme-field rounded-2xl border px-4 py-3">
                  <p className="text-xs text-stone-400">Y</p>
                  <p className="mt-1 font-semibold text-ink">{selected.pos_y}</p>
                </div>
                <div className="theme-field rounded-2xl border px-4 py-3">
                  <p className="text-xs text-stone-400">W</p>
                  <p className="mt-1 font-semibold text-ink">{selected.pos_w}</p>
                </div>
                <div className="theme-field rounded-2xl border px-4 py-3">
                  <p className="text-xs text-stone-400">H</p>
                  <p className="mt-1 font-semibold text-ink">{selected.pos_h}</p>
                </div>
                <div className="theme-field col-span-2 rounded-2xl border px-4 py-3">
                  <p className="text-xs text-stone-400">
                    {locale === "ko" ? "방향" : locale === "en" ? "Orientation" : "Ausrichtung"}
                  </p>
                  <p className="mt-1 font-semibold text-ink">
                    {selected.pos_rotation === 90
                      ? locale === "ko"
                        ? "세로 방향"
                        : locale === "en"
                          ? "Vertical"
                        : "Vertikal"
                      : locale === "ko"
                        ? "가로 방향"
                        : locale === "en"
                          ? "Horizontal"
                        : "Horizontal"}
                  </p>
                </div>
              </div>
              <form action={saveRestaurantFloorplanAction} className="theme-field space-y-3 rounded-2xl border p-4">
                <p className="text-sm font-medium text-ink">
                  {locale === "ko" ? "홀 평면도 배경" : locale === "en" ? "Floor plan background" : "Hall-Hintergrund"}
                </p>
                <input
                  name="floorplan"
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-full file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm file:font-medium"
                />
                <Button type="submit" variant="secondary">
                  <Upload className="mr-2 h-4 w-4" />
                  {locale === "ko" ? "평면도 업로드" : locale === "en" ? "Upload floor plan" : "Grundriss hochladen"}
                </Button>
              </form>
              <p className="theme-field rounded-2xl border border-dashed px-4 py-3 text-xs text-stone-500">
                {locale === "ko"
                  ? "격자에 맞춰 자동 스냅되고, 다른 테이블과 겹치지 않도록 자동으로 빈 자리로 밀려납니다. 크기 변경도 충돌하면 더 이상 커지지 않습니다. 회전 버튼으로 2인석/4인석의 가로세로 방향도 바꿀 수 있습니다."
                  : locale === "en"
                    ? "Tables snap to the grid and avoid overlapping automatically. If resizing would collide with another table, it stops growing. You can also rotate 2-seat and 4-seat tables between horizontal and vertical orientations."
                  : "Tische rasten automatisch im Grid ein. Bei Kollisionen wird der Tisch an die nächste freie Position geschoben, und Größenänderungen stoppen vor Überschneidungen. Über Drehen lässt sich auch die horizontale/vertikale Ausrichtung anpassen."}
              </p>
            </div>
          ) : (
            <p className="text-sm text-stone-500">
              {locale === "ko"
                ? "편집할 테이블을 선택하세요."
                : locale === "en"
                  ? "Select a table to edit."
                : "Wählen Sie einen Tisch zum Bearbeiten aus."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
