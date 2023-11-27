export const validateAgeRange = (date: Date, min: number, max = -1) => {
  // parse date
  // make sure over 15
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  if (max == -1) {
    return min <= age;
  }
  return min <= age && age <= max;
};

export const validateWordLength = (sentence: string, limit: number) => {
  return sentence.split(/\s/g).length <= limit;
};

export const validateIsTrue = (isTrue: boolean) => {
  return isTrue === true;
};

export const transformStringToNullIfEmpty = (value: string) => {
  return value ?? null;
};
