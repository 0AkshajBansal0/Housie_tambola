export const getExpectedType = (number) => {

  const colIndex = Math.floor((number - 1) / 10);

  const pattern = ["CODING", "MCQ", "CASE"];

  return pattern[colIndex % 3];
};