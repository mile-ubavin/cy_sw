// Parses German datetime string "dd.mm.yyyy hh:mm" into a JS Date object.
export function parseGermanDateTime(dateTimeStr) {
  const [datePart, timePart] = dateTimeStr.split(' ');
  const [day, month, year] = datePart.split('.').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}
