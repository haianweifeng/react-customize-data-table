export function generateUUID() {
  const time = new Date().getTime().toString(36);
  let random = Math.random().toString(36);
  random = random.substring(2, random.length);
  return `${random}${time}`;
}
