export const refineAgeRange = (
  date: Date,
  min: number,
  max: number | undefined = undefined
) => {
  // parse date
  // make sure over 15
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  if (!max) {
    return min <= age;
  }
  return min <= age && age <= max;
};

export const refineWordLength = (sentence: string, limit: number) => {
  return sentence.split(/\s/g).length <= limit;
};

export const refineIsTrue = (isTrue: boolean) => {
  return isTrue === true;
};

export const transformStringToNullIfEmpty = (value: string | null) => {
  return value === "" ? null : value;
};
