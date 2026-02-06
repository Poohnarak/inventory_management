const authService = require('../services/auth.service');
const { success, created } = require('../utils/response');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return created(res, result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return success(res, result);
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  return success(res, { user: req.user });
}

module.exports = { register, login, me };
