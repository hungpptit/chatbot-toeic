import db from '../models/index.js';

/**
 * Check if a user with the given ID exists and has role_id === 1.
 * @param id - User ID
 * @returns true if valid regular user, false otherwise
 */
const isRegularUser = async (id) => {
  try {
    const user = await db.User.findOne({ where: { id } });
    const isValid = !!user && user.role_id === 1;

    if (!isValid) {
      console.warn(`[isRegularUser] User with ID ${id} is invalid or not a regular user.`);
    }

    return isValid;
  } catch (error) {
    console.error(`[isRegularUser] Failed to check user with ID ${id}:`, error);
    return false;
  }
};

/**
 * Get user by ID if the user is a regular user.
 * @param id - User ID
 * @returns User object or null
 */
const getUserById = async (id) => {
  try {
    if (!(await isRegularUser(id))) return null;

    const user = await db.User.findOne({ where: { id } });
    return user;
  } catch (error) {
    console.error(`[getUserById] Error retrieving user with ID ${id}:`, error);
    return null;
  }
};

/**
 * Update user data if user is a regular user.
 * @param id - User ID
 * @param data - Fields to update
 * @returns Updated user object or null
 */
const updateUser = async (id, data) => {
  try {
    if (!(await isRegularUser(id))) return null;

    const user = await db.User.findOne({ where: { id } });
    if (!user) {
      console.warn(`[updateUser] Cannot update: User with ID ${id} not found.`);
      return null;
    }

    await user.update(data);
    return user;
  } catch (error) {
    console.error(`[updateUser] Failed to update user with ID ${id}:`, error);
    return null;
  }
};

export default {
  getUserById,
  updateUser,
};
