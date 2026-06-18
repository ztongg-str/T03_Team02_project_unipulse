export const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const created = (res, data = null, message = 'Created successfully') => {
  return res.status(201).json({ success: true, message, data });
};

export const paginated = (res, data, total, page, limit, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

export const error = (res, message = 'Internal server error', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};
