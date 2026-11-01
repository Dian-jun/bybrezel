// Browser-local poster export. Personal story text never enters the image.
export function memoryPosterEvents(events) {
  return [...new Map(events.map((event) => [event.id, event])).values()].sort(
    (a, b) =>
      a.date_start.localeCompare(b.date_start) || a.id.localeCompare(b.id),
  );
}
export function memoryPosterTokens(events, ids) {
  const chosen = new Set(ids);
  let year = "";
  return memoryPosterEvents(events).flatMap((event) => {
    const nextYear = event.date_start.slice(0, 4);
    const prefix =
      nextYear !== year ? [{ text: nextYear + " / ", kind: "year" }] : [];
    year = nextYear;
    return [
      ...prefix,
      { text: event.title, kind: chosen.has(event.id) ? "chosen" : "quiet" },
      { text: " · ", kind: "separator" },
    ];
  });
}
// A bounded, deterministic text layout keeps even the full chronology exportable.
export function layoutMemoryPoster(
  tokens,
  measure,
  { width = 984, lineHeight = 32 } = {},
) {
  let x = 0,
    y = 0;
  const runs = [];
  for (const token of tokens) {
    const wordWidth = measure(token.text);
    if (x && x + wordWidth > width) {
      x = 0;
      y += lineHeight;
    }
    if (wordWidth <= width) {
      runs.push({ ...token, x, y, width: wordWidth });
      x += wordWidth;
    } else {
      for (const char of token.text) {
        const charWidth = measure(char);
        if (x && x + charWidth > width) {
          x = 0;
          y += lineHeight;
        }
        runs.push({ ...token, text: char, x, y, width: charWidth });
        x += charWidth;
      }
    }
  }
  return { runs, height: y + lineHeight };
}
export function fitMemoryPoster(tokens, measure) {
  for (let size = 24; size >= 12; size -= 2) {
    const layout = layoutMemoryPoster(tokens, (text) => measure(text, size), {
      lineHeight: Math.ceil(size * 1.55),
    });
    if (layout.height <= 11600) return { size, layout };
  }
  throw Error("이미지가 너무 깁니다. 연도를 선택한 뒤 저장해 주세요.");
}
export async function saveMemoryPoster(events, ids, period) {
  await document.fonts?.ready;
  const canvas = document.createElement("canvas"),
    context = canvas.getContext("2d");
  if (!context)
    throw Error("이 브라우저에서는 이미지 저장을 지원하지 않습니다.");
  const family = '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
  const tokens = memoryPosterTokens(events, ids);
  const { size, layout } = fitMemoryPoster(tokens, (text, size) => {
    context.font = `${size}px ${family}`;
    return context.measureText(text).width;
  });
  canvas.width = 1080;
  canvas.height = layout.height + 312;
  context.fillStyle = "#f3f0e8";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#1d1d1b";
  context.font = `28px ${family}`;
  context.fillText("그날 우리는", 48, 64);
  context.fillStyle = "#cd2e3a";
  context.beginPath();
  context.arc(206, 54, 4, 0, Math.PI * 2);
  context.fill();
  context.font = `16px ${family}`;
  context.fillStyle = "#6c6a64";
  context.fillText(`나의 기억 / ${period}`, 48, 103);
  context.fillStyle = "#1d1d1b";
  context.fillRect(48, 128, 984, 1);
  context.font = `${size}px ${family}`;
  for (const run of layout.runs) {
    context.fillStyle =
      run.kind === "chosen"
        ? "#1d1d1b"
        : run.kind === "year"
          ? "#78756e"
          : "#b7b3aa";
    context.fillText(run.text, 48 + run.x, 180 + run.y);
    if (run.kind === "chosen") {
      context.fillStyle = "#cd2e3a";
      context.fillRect(48 + run.x, 186 + run.y, Math.max(1, run.width), 1.5);
    }
  }
  const selected = new Set(ids),
    count = memoryPosterEvents(events).filter((e) => selected.has(e.id)).length;
  context.fillStyle = "#1d1d1b";
  context.fillRect(48, canvas.height - 91, 984, 1);
  context.font = `16px ${family}`;
  context.fillStyle = "#6c6a64";
  context.fillText(
    `${count}개의 기억 / ${events.length}개의 사건`,
    48,
    canvas.height - 48,
  );
  context.textAlign = "right";
  context.fillText("bybrezel.com/thatday", 1032, canvas.height - 48);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw Error("이미지를 만들지 못했습니다. 다시 시도해 주세요.");
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = "thatday-my-memory.png";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
