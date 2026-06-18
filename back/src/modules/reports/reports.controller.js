import * as reportsService from './reports.service.js';
import { success, created, error } from '../../utils/response.js';

export const createReport = async (req, res, next) => {
  try {
    const report = await reportsService.createReport({ ...req.body, reporterId: req.user.id });
    return created(res, report, 'Report submitted successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const getAllReports = async (req, res, next) => {
  try {
    const reports = await reportsService.getAllReports(req.query);
    return success(res, reports);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    const report = await reportsService.resolveReport(req.params.id);
    return success(res, report, 'Report resolved successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    await reportsService.deleteReport(req.params.id);
    return success(res, null, 'Report deleted successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};
