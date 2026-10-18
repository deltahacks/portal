const countWords = (str: string) =>
  str.trim().split(/\s+/).filter(Boolean).length;

export default countWords;
