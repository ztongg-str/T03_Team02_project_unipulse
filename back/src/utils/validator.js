export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isNotEmpty = (value) => value !== undefined && value !== null && value.toString().trim().length > 0;

export const isLength = (value, min, max) => {
  const len = value.toString().length;
  return len >= min && len <= max;
};

export const isInEnum = (value, allowedValues) => allowedValues.includes(value);
