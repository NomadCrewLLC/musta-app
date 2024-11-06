export function parseDate(timeString: string) {
  const [time, period] = timeString.split(/\s+/);
  const [hoursStr, minuteStr] = time.split(":");

  // Convert to 24-hour format
  const hour =
    period === "PM" && hoursStr !== "12"
      ? parseInt(hoursStr) + 12
      : period === "AM" && hoursStr === "12"
      ? 0
      : parseInt(hoursStr);

  const minute = parseInt(minuteStr);

  return { hour, minute };
}

export function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
