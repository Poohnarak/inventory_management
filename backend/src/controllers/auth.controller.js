const authService = require('../services/auth.service');
const { success, created } = require('../utils/response');

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

async function getShops(req, res, next) {
  try {
    const shops = await authService.getShops();
    return success(res, shops);
  } catch (error) {
    next(error);
  }
}

// --- User management (ADMIN only, uses shop user DB) ---

async function createUser(req, res, next) {
  try {
    const { username, password, role } = req.body;
    const user = await authService.createUser({
      username,
      password,
      role,
      userDbName: req.user.userDb,
    });
    return created(res, user);
  } catch (error) {
    next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await authService.getUsersByShop(req.user.userDb);
    return success(res, users);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const result = await authService.deleteUser(
      parseInt(req.params.id, 10),
      req.user.id,
      req.user.userDb
    );
    return success(res, result);
  } catch (error) {
    next(error);
  }
}

module.exports = { login, me, getShops, createUser, getUsers, deleteUser };
