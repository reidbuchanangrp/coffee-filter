import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface DayHours {
  open: string;
  close: string;
}

export interface WeeklyHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

interface WeeklyHoursInputProps {
  value: WeeklyHours;
  onChange: (value: WeeklyHours) => void;
}

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

// Generate time options in 30-minute increments
function generateTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const h = hour % 12 || 12;
      const period = hour < 12 ? "am" : "pm";
      const label = `${h}:${minute.toString().padStart(2, "0")} ${period}`;
      const value = `${h}${minute === 0 ? "" : `:${minute.toString().padStart(2, "0")}`}${period}`;
      options.push({ value, label });
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

const DEFAULT_HOURS: DayHours = { open: "7am", close: "5pm" };

export function WeeklyHoursInput({ value, onChange }: WeeklyHoursInputProps) {
  const handleDayToggle = (day: DayKey, isOpen: boolean) => {
    const newValue = { ...value };
    if (isOpen) {
      // When enabling a day, copy hours from another open day or use defaults
      const existingDay = DAYS.find((d) => value[d.key]);
      newValue[day] = existingDay
        ? { ...value[existingDay.key]! }
        : { ...DEFAULT_HOURS };
    } else {
      delete newValue[day];
    }
    onChange(newValue);
  };

  const handleTimeChange = (
    day: DayKey,
    field: "open" | "close",
    time: string
  ) => {
    if (!value[day]) return;
    onChange({
      ...value,
      [day]: {
        ...value[day],
        [field]: time,
      },
    });
  };

  const applyToAll = (sourceDay: DayKey) => {
    const sourceHours = value[sourceDay];
    if (!sourceHours) return;
    console.log(sourceHours);
    const newValue: WeeklyHours = {};
    DAYS.forEach((day) => {
      newValue[day.key] = { ...sourceHours };
    });
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <Label>Hours of Operation</Label>
      <div className="space-y-2">
        {DAYS.map((day) => {
          const dayHours = value[day.key];
          const isOpen = !!dayHours;

          return (
            <div
              key={day.key}
              className="flex items-center gap-3 py-2 border-b last:border-b-0"
            >
              <div className="w-24 flex items-center gap-2">
                <Switch
                  checked={isOpen}
                  onCheckedChange={(checked) =>
                    handleDayToggle(day.key, checked)
                  }
                  data-testid={`switch-${day.key}`}
                />
                <span className="text-sm font-medium">
                  {day.label.slice(0, 3)}
                </span>
              </div>

              {isOpen ? (
                <div className="flex items-center gap-2 flex-1">
                  <Select
                    value={dayHours.open}
                    onValueChange={(time) =>
                      handleTimeChange(day.key, "open", time)
                    }
                  >
                    <SelectTrigger
                      className="w-[110px]"
                      data-testid={`select-${day.key}-open`}
                    >
                      <SelectValue placeholder="Open" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground text-sm">to</span>
                  <Select
                    value={dayHours.close}
                    onValueChange={(time) =>
                      handleTimeChange(day.key, "close", time)
                    }
                  >
                    <SelectTrigger
                      className="w-[110px]"
                      data-testid={`select-${day.key}-close`}
                    >
                      <SelectValue placeholder="Close" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      applyToAll(day.key);
                    }}
                    className="text-xs text-primary hover:text-primary/80 hover:underline ml-auto px-2 py-1"
                    title="Apply these hours to all open days"
                  >
                    Apply to all
                  </button>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Closed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to convert legacy format to new format
export function convertLegacyHours(
  hours: string,
  daysOpen: string[]
): WeeklyHours {
  const result: WeeklyHours = {};

  // Parse hours string like "7am - 5pm"
  const parts = hours.split(/\s*[-–]\s*/);
  const open = parts[0]?.trim().toLowerCase().replace(/\s+/g, "") || "7am";
  const close = parts[1]?.trim().toLowerCase().replace(/\s+/g, "") || "5pm";

  // Map day names to keys
  const dayNameToKey: Record<string, DayKey> = {
    Monday: "monday",
    Tuesday: "tuesday",
    Wednesday: "wednesday",
    Thursday: "thursday",
    Friday: "friday",
    Saturday: "saturday",
    Sunday: "sunday",
  };

  daysOpen.forEach((dayName) => {
    const key = dayNameToKey[dayName];
    if (key) {
      result[key] = { open, close };
    }
  });

  return result;
}

// Helper to check if currently open
export function isCurrentlyOpen(weeklyHours: WeeklyHours): boolean {
  const now = new Date();
  const days: DayKey[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const currentDay = days[now.getDay()];
  const dayHours = weeklyHours[currentDay];

  if (!dayHours) return false;

  const parseTime = (timeStr: string): number | null => {
    const match = timeStr
      .trim()
      .toLowerCase()
      .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const period = match[3];

    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const openTime = parseTime(dayHours.open);
  const closeTime = parseTime(dayHours.close);

  if (openTime === null || closeTime === null) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return currentMinutes >= openTime && currentMinutes < closeTime;
}

// Get today's hours for display
export function getTodayHours(weeklyHours: WeeklyHours): string | null {
  const days: DayKey[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const currentDay = days[new Date().getDay()];
  const dayHours = weeklyHours[currentDay];

  if (!dayHours) return null;

  return `${dayHours.open} - ${dayHours.close}`;
}
