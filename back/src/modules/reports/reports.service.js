import * as reportsRepository from './reports.repository.js';

export const createReport = async (data) => {
  const id = await reportsRepository.create(data);
  return reportsRepository.findById(id);
};

export const getAllReports = async (query) => {
  return reportsRepository.findAll(query);
};

export const resolveReport = async (id) => {
  const report = await reportsRepository.findById(id);
  if (!report) {
    const err = new Error('Report not found');
    err.statusCode = 404;
    throw err;
  }
  await reportsRepository.update(id, { status: 'resolved' });
  return reportsRepository.findById(id);
};

export const deleteReport = async (id) => {
  const report = await reportsRepository.findById(id);
  if (!report) {
    const err = new Error('Report not found');
    err.statusCode = 404;
    throw err;
  }
  await reportsRepository.remove(id);
};
