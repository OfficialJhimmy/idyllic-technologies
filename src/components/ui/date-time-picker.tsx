"use client";

import { CalendarBlank, CaretLeft, CaretRight, Moon, Sun, SunHorizon, X } from "@phosphor-icons/react";
import * as Popover from "@radix-ui/react-popover";
import { useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldShell } from "@/components/ui/field";
import { fromLocalInput, toLocalInput } from "@/lib/blog/draft";
import {
  WEEKDAYS,
  addDays,
  addMonths,
  clampToNow,
  isoDay,
  isSameDay,
  monthGrid,
  partOfDay,
  startOfDay,
  to12Hour,
  to24Hour,
  withDate,
  withTime,
  type PartOfDay,
} from "@/lib/date-picker";

type Props = {
  id: string;
  label: string;
  /** A datetime-local style value ("2026-09-30T08:15") in the viewer's time zone, or empty. */
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  /** Open on first render. Used for screenshots and tests. */
  defaultOpen?: boolean;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const triggerFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
const weekdayFormat = new Intl.DateTimeFormat("en-GB", { weekday: "long" });
const longFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

const parts: Record<PartOfDay, { label: string; Icon: typeof Sun }> = {
  morning: { label: "Morning", Icon: SunHorizon },
  afternoon: { label: "Afternoon", Icon: Sun },
  evening: { label: "Evening", Icon: SunHorizon },
  night: { label: "Night", Icon: Moon },
};

const NARROW_QUERY = "(max-width: 719px)";
const subscribeNarrow = (callback: () => void) => {
  const query = window.matchMedia(NARROW_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const isNarrow = () => window.matchMedia(NARROW_QUERY).matches;

const pad = (n: number) => String(n).padStart(2, "0");
const press = "transition-[background-color,color,transform] duration-150 ease-[var(--ease-out-strong)] active:scale-[0.95]";

/**
 * A date and time picker built for this project instead of the browser's own. Dates after now cannot
 * be chosen, because posts cannot be scheduled. Fully usable by keyboard: arrow keys move between
 * days, Page Up and Page Down change month.
 */
export function DateTimePicker({ id, label, value, onChange, hint, error, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [now, setNow] = useState(() => new Date());
  const selectedIso = fromLocalInput(value);
  const selected = selectedIso ? new Date(selectedIso) : null;
  const [view, setView] = useState(() => selected ?? new Date());
  const [mode, setMode] = useState<"days" | "months">("days");
  const [direction, setDirection] = useState<1 | -1>(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const narrow = useSyncExternalStore(subscribeNarrow, isNarrow, () => false);

  const today = startOfDay(now);
  const set = (date: Date) => onChange(toLocalInput(clampToNow(date, now).toISOString()));
  // With nothing chosen yet the time starts at 9:00 am, or now if that is still ahead, so no chip starts disabled.
  const base = selected ?? clampToNow(withTime(today, 9, 0), now);

  function handleOpenChange(next: boolean) {
    if (next) {
      const current = new Date();
      setNow(current);
      setView(selected ?? current);
      setMode("days");
    }
    setOpen(next);
  }

  function goToMonth(date: Date, dir: 1 | -1) {
    setDirection(dir);
    setView(date);
  }

  function focusDay(date: Date) {
    const find = () => gridRef.current?.querySelector<HTMLElement>(`[data-day="${isoDay(date)}"]`);
    // On screen already: focus now, so held keys always start from where the last one ended.
    // Otherwise wait for the new month to render.
    const now = find();
    if (now) now.focus();
    else requestAnimationFrame(() => find()?.focus());
  }

  function onGridKeyDown(event: React.KeyboardEvent) {
    const active = (document.activeElement as HTMLElement | null)?.dataset.day;
    if (!active) return;
    const [y, m, d] = active.split("-").map(Number) as [number, number, number];
    const current = new Date(y, m - 1, d);
    const move: Record<string, Date> = {
      ArrowLeft: addDays(current, -1),
      ArrowRight: addDays(current, 1),
      ArrowUp: addDays(current, -7),
      ArrowDown: addDays(current, 7),
      PageUp: addMonths(current, -1),
      PageDown: addMonths(current, 1),
      Home: addDays(current, -((current.getDay() + 6) % 7)),
      End: addDays(current, 6 - ((current.getDay() + 6) % 7)),
    };
    const target = move[event.key];
    if (!target) return;
    event.preventDefault();
    const clamped = target > today ? today : target;
    if (clamped.getMonth() !== view.getMonth() || clamped.getFullYear() !== view.getFullYear()) goToMonth(clamped, clamped > view ? 1 : -1);
    focusDay(clamped);
  }

  const hour = to12Hour(base.getHours());
  const onToday = isSameDay(base, today);
  const isFuture = (h24: number, minute: number) => onToday && withTime(base, h24, minute).getTime() > now.getTime();
  const grid = monthGrid(view.getFullYear(), view.getMonth());
  const atCurrentMonth = view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth();
  const part = selected ? parts[partOfDay(selected.getHours())] : null;

  const body = (inSheet: boolean) => (
    <>
              {/* The ticket: the chosen moment, at a glance. */}
              <div className="flex items-center justify-between gap-4 rounded-card bg-sunken px-4 py-3">
                {selected ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="font-heading text-5xl leading-none font-medium tabular-nums">{selected.getDate()}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{weekdayFormat.format(selected)}</span>
                        <span className="text-sm text-ink-muted">{longFormat.format(selected).replace(/^\d+ /, "")}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="flex items-center gap-1.5 font-medium tabular-nums">
                        {part ? <part.Icon size={18} weight="fill" aria-hidden className="text-ink-muted" /> : null}
                        {to12Hour(selected.getHours()).hour}:{pad(selected.getMinutes())} {selected.getHours() >= 12 ? "pm" : "am"}
                      </span>
                      <span className="text-sm text-ink-muted">{part?.label}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-ink-muted">Pick a day below, then adjust the time.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Quick picks">
                <Chip onClick={() => { set(new Date()); const n = new Date(); setView(n); }}>Now</Chip>
                <Chip onClick={() => { set(withDate(base, today)); setView(today); }}>Today</Chip>
                <Chip onClick={() => { const y = addDays(today, -1); set(withDate(base, y)); setView(y); }}>Yesterday</Chip>
              </div>

              <div className="flex flex-col gap-4 min-[720px]:grid min-[720px]:grid-cols-[19.5rem_minmax(0,1fr)] min-[720px]:gap-6">
              <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <button type="button" aria-label={mode === "days" ? "Previous month" : "Previous year"} onClick={() => goToMonth(addMonths(view, mode === "days" ? -1 : -12), -1)} className={`flex h-11 w-11 items-center justify-center rounded-full hover:bg-sunken ${press}`}>
                  <CaretLeft size={18} aria-hidden />
                </button>
                <button type="button" aria-label={mode === "days" ? "Choose month and year" : "Back to days"} aria-expanded={mode === "months"} onClick={() => setMode((m) => (m === "days" ? "months" : "days"))} className={`h-11 rounded-full px-4 font-heading text-lg font-medium hover:bg-sunken ${press}`}>
                  {mode === "days" ? `${MONTHS[view.getMonth()]} ${view.getFullYear()}` : view.getFullYear()}
                </button>
                <button type="button" aria-label={mode === "days" ? "Next month" : "Next year"} disabled={mode === "days" ? atCurrentMonth : view.getFullYear() >= today.getFullYear()} onClick={() => goToMonth(addMonths(view, mode === "days" ? 1 : 12), 1)} className={`flex h-11 w-11 items-center justify-center rounded-full hover:bg-sunken disabled:opacity-30 ${press}`}>
                  <CaretRight size={18} aria-hidden />
                </button>
              </div>

              <div key={`${mode}-${view.getFullYear()}-${view.getMonth()}`} className="picker-slide" style={{ ["--dir" as string]: direction }}>
                {mode === "months" ? (
                  <div className="grid grid-cols-3 gap-2" role="group" aria-label="Months">
                    {MONTHS.map((name, i) => {
                      const future = view.getFullYear() > today.getFullYear() || (view.getFullYear() === today.getFullYear() && i > today.getMonth());
                      const current = i === view.getMonth();
                      return (
                        <button key={name} type="button" disabled={future} aria-pressed={current} onClick={() => { goToMonth(new Date(view.getFullYear(), i, 1), 1); setMode("days"); }} className={`h-11 rounded-full text-[0.9375rem] font-medium disabled:opacity-30 ${press} ${current ? "bg-action text-on-action" : "hover:bg-sunken"}`}>
                          {name.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div ref={gridRef} role="grid" aria-label={`${MONTHS[view.getMonth()]} ${view.getFullYear()}`} onKeyDown={onGridKeyDown}>
                    <div role="row" className="mb-1 grid grid-cols-7">
                      {WEEKDAYS.map((d) => (
                        <span key={d} role="columnheader" className="flex h-8 items-center justify-center text-xs font-medium text-ink-muted">
                          {d}
                        </span>
                      ))}
                    </div>
                    {grid.map((week, wi) => (
                      <div key={wi} role="row" className="grid grid-cols-7">
                        {week.map(({ date, inMonth }) => {
                          const future = date > today;
                          const isSelected = selected ? isSameDay(date, selected) : false;
                          const isToday = isSameDay(date, today);
                          const focusTarget = isSelected || (!selected && isSameDay(date, atCurrentMonth ? today : new Date(view.getFullYear(), view.getMonth(), 1)));
                          return (
                            <div key={isoDay(date)} role="gridcell" aria-selected={isSelected}>
                              <button
                                type="button"
                                data-day={isoDay(date)}
                                tabIndex={focusTarget ? 0 : -1}
                                disabled={future}
                                aria-label={longFormat.format(date)}
                                aria-current={isToday ? "date" : undefined}
                                onClick={() => { set(withDate(base, date)); if (!inMonth) setView(date); }}
                                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[0.9375rem] tabular-nums pointer-coarse:h-11 pointer-coarse:w-11 ${press} ${
                                  isSelected ? "bg-action font-medium text-on-action" : future ? "text-ink-muted opacity-35" : `hover:bg-sunken ${inMonth ? "text-ink" : "text-ink-muted"}`
                                } ${isToday && !isSelected ? "ring-1 ring-action ring-inset" : ""}`}
                              >
                                {date.getDate()}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              </div>

              <div className="flex flex-col gap-3 border-t border-line pt-4 min-[720px]:border-t-0 min-[720px]:border-l min-[720px]:pt-0 min-[720px]:pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Time</span>
                  <div role="group" aria-label="Morning or afternoon" className="inline-flex rounded-full border border-line-strong p-0.5">
                    {([false, true] as const).map((pm) => {
                      const active = Boolean(selected) && hour.pm === pm;
                      return (
                        <button key={String(pm)} type="button" aria-pressed={active} disabled={pm && isFuture(12, 0) && !active && onToday && now.getHours() < 12} onClick={() => set(withTime(base, to24Hour(hour.hour, pm), base.getMinutes()))} className={`h-10 w-14 rounded-full text-sm font-medium disabled:opacity-30 ${press} ${active ? "bg-primary text-on-primary" : "text-ink-muted hover:bg-sunken"}`}>
                          {pm ? "pm" : "am"}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-1" role="group" aria-label="Hour">
                  {HOURS.map((h) => (
                    <button key={h} type="button" aria-pressed={Boolean(selected) && hour.hour === h} disabled={isFuture(to24Hour(h, hour.pm), 0)} onClick={() => set(withTime(base, to24Hour(h, hour.pm), base.getMinutes()))} className={`h-10 rounded-full text-[0.9375rem] tabular-nums disabled:opacity-30 pointer-coarse:h-11 ${press} ${selected && hour.hour === h ? "bg-action font-medium text-on-action" : "hover:bg-sunken"}`}>
                      {h}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-6 gap-1" role="group" aria-label="Minutes">
                  {MINUTES.map((m) => (
                    <button key={m} type="button" aria-pressed={Boolean(selected) && base.getMinutes() === m} disabled={isFuture(base.getHours(), m)} onClick={() => set(withTime(base, base.getHours(), m))} className={`h-10 rounded-full text-[0.9375rem] tabular-nums disabled:opacity-30 pointer-coarse:h-11 ${press} ${selected && base.getMinutes() === m ? "bg-action font-medium text-on-action" : "text-ink-muted hover:bg-sunken"}`}>
                      :{pad(m)}
                    </button>
                  ))}
                </div>
              </div>

              </div>

              <div className={`sticky z-10 flex items-center justify-between border-t border-line bg-surface py-3 ${inSheet ? "bottom-0" : "-bottom-4 -mx-4 -mb-4 px-4"}`}>
                <Button variant="ghost" onClick={() => { onChange(""); setOpen(false); }}>
                  Clear
                </Button>
                <Button onClick={() => setOpen(false)}>Done</Button>
              </div>
                </>
  );

  const triggerClass = `flex h-12 w-full items-center gap-3 rounded-input border bg-surface pr-12 pl-4 text-left text-base transition-colors duration-150 ${error ? "border-error" : "border-line-strong"}`;
  const triggerLabel = `${label}: ${selected ? triggerFormat.format(selected) : "not set"}`;
  const triggerContent = (
    <>
      <CalendarBlank size={20} aria-hidden className="shrink-0 text-ink-muted" />
      {selected ? <span className="truncate">{triggerFormat.format(selected).replace(/\b(am|pm)\b/i, (m) => m.toLowerCase())}</span> : <span className="truncate text-ink-muted">Choose a date and time</span>}
    </>
  );
  const clearButton = selected ? (
    <button type="button" aria-label="Clear the date" onClick={() => onChange("")} className={`absolute top-1/2 right-1 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-sunken hover:text-ink ${press}`}>
      <X size={18} aria-hidden />
    </button>
  ) : null;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      {(aria) =>
        narrow ? (
          // Small screens get a full screen sheet, so the whole calendar is always reachable.
          <>
            <div className="relative">
              <button type="button" id={id} {...aria} aria-haspopup="dialog" aria-label={triggerLabel} onClick={() => handleOpenChange(true)} className={triggerClass}>
                {triggerContent}
              </button>
              {clearButton}
            </div>
            <Dialog open={open} onOpenChange={handleOpenChange} title="Choose a date and time" size="lg">
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">{body(true)}</div>
            </Dialog>
          </>
        ) : (
          <Popover.Root open={open} onOpenChange={handleOpenChange} modal>
            <div className="relative">
              <Popover.Trigger id={id} {...aria} aria-label={triggerLabel} className={triggerClass}>
                {triggerContent}
              </Popover.Trigger>
              {clearButton}
            </div>
            <Popover.Portal>
              <Popover.Content
                align="start"
                sideOffset={8}
                collisionPadding={16}
                aria-label="Choose a date and time"
                className="picker-content z-50 flex max-h-(--radix-popover-content-available-height) w-[min(22.5rem,calc(100vw-2rem))] flex-col gap-4 overflow-y-auto overscroll-contain rounded-container bg-surface p-4 shadow-raised outline-none min-[720px]:w-[min(40.5rem,calc(100vw-2rem))]"
              >
                {body(false)}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        )
      }
    </FieldShell>
  );
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`h-9 rounded-full border border-line-strong px-4 text-sm font-medium hover:bg-sunken ${press}`}>
      {children}
    </button>
  );
}
