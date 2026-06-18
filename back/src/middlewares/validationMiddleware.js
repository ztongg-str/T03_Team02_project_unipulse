import { error } from '../utils/response.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    if (schema.body) {
      for (const [field, rules] of Object.entries(schema.body)) {
        const value = req.body[field];
        for (const rule of rules) {
          const err = rule(value, field);
          if (err) { errors.push(err); break; }
        }
      }
    }
    if (schema.params) {
      for (const [field, rules] of Object.entries(schema.params)) {
        const value = req.params[field];
        for (const rule of rules) {
          const err = rule(value, field);
          if (err) { errors.push(err); break; }
        }
      }
    }
    if (schema.query) {
      for (const [field, rules] of Object.entries(schema.query)) {
        const value = req.query[field];
        for (const rule of rules) {
          const err = rule(value, field);
          if (err) { errors.push(err); break; }
        }
      }
    }
    if (errors.length > 0) {
      return error(res, errors.join(', '), 400);
    }
    next();
  };
};

export const required = (value, field) => {
  if (value === undefined || value === null || value.toString().trim() === '') {
    return `${field} is required`;
  }
  return null;
};

export const isEmail = (value, field) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return `${field} must be a valid email`;
  }
  return null;
};

export const minLength = (min) => (value, field) => {
  if (value && value.toString().length < min) {
    return `${field} must be at least ${min} characters`;
  }
  return null;
};

export const isIn = (allowed) => (value, field) => {
  if (value && !allowed.includes(value)) {
    return `${field} must be one of: ${allowed.join(', ')}`;
  }
  return null;
};
