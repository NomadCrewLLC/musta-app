function convertTo24HourString(period : string, hoursStr: string) {
  let hour;

  if (period === "PM" && hoursStr !== "12") {
    hour = parseInt(hoursStr) + 12;
  } else if (period === "AM" && hoursStr === "12") {
    hour = "00";
  } else {
    parseInt(hoursStr);
  }

  return Number(hour)
}

export function parseTimeIntoString(timeString: string) {
  //from 11:46 PM returns 23:46 to use for timeString
  const [time, period] = timeString.split(/\s+/);
  const [hoursStr, minuteStr] = time.split(":");

  const hour = convertTo24HourString(period, hoursStr)

  return `${hour}:${minuteStr}`;
}

export function parseTimeIntoObject(timeString: string) {
  // from 11:46pm returns {hour: 23 minute: 46}
  const [time, period] = timeString.split(/\s+/);
  const [hoursStr, minuteStr] = time.split(":");

  return {
    hour: convertTo24HourString(period, hoursStr),
    minute: parseInt(minuteStr),
  };
}

export function formatToDateObject(timeString: string) {
  const Hour24TimeStr = parseTimeIntoString(timeString)
  const date = `2024-11-12T${Hour24TimeStr}:00Z`;
  const localDateTime = new Date(date);

  const utcDate = new Date(
    localDateTime.getTime() + localDateTime.getTimezoneOffset() * 60000
  );

  return utcDate;
}

export function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date: Date) {
  return new Date(date).toLocaleTimeString([], {
    year: "numeric",
    day: "numeric",
    month: "numeric",
  });
}
