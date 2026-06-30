import * as achievementsRepository from './achievements.repository.js';

export const getMyAchievements = async (userId) => {
  return achievementsRepository.findByUserId(userId);
};

export const getAllAchievements = async () => {
  return achievementsRepository.findAll();
};

export const getAllWithStatus = async (userId) => {
  return achievementsRepository.findAllWithUserStatus(userId);
};

export const createAchievement = async (data) => {
  const id = await achievementsRepository.create(data);
  return achievementsRepository.findById(id);
};

export const updateAchievement = async (id, data) => {
  const achievement = await achievementsRepository.findById(id);
  if (!achievement) {
    const err = new Error('Achievement not found');
    err.statusCode = 404;
    throw err;
  }
  await achievementsRepository.update(id, data);
  return achievementsRepository.findById(id);
};

export const deleteAchievement = async (id) => {
  const achievement = await achievementsRepository.findById(id);
  if (!achievement) {
    const err = new Error('Achievement not found');
    err.statusCode = 404;
    throw err;
  }
  await achievementsRepository.remove(id);
};

export const checkAndGrant = async (userId, actionType) => {
  const granted = [];

  const checks = {
    register_1_event: async () => {
      const count = await achievementsRepository.countRegistrations(userId);
      return count >= 1;
    },
    attend_3_events: async () => {
      const count = await achievementsRepository.countAttended(userId);
      return count >= 3;
    },
    add_3_friends: async () => {
      const count = await achievementsRepository.countFriends(userId);
      return count >= 3;
    },
    add_10_friends: async () => {
      const count = await achievementsRepository.countFriends(userId);
      return count >= 10;
    },
    explore_3_categories: async () => {
      const cats = await achievementsRepository.getDistinctCategories(userId);
      return cats.length >= 3;
    },
    earn_5_achievements: async () => {
      const count = await achievementsRepository.countEarnedByUser(userId);
      return count >= 5;
    },
    level_5: async () => {
      const user = await achievementsRepository._getUserLevel(userId);
      return user && user.level >= 5;
    },
    level_10: async () => {
      const user = await achievementsRepository._getUserLevel(userId);
      return user && user.level >= 10;
    },
    complete_profile: async () => {
      const user = await achievementsRepository._getUserProfile(userId);
      return !!(user && user.bio && user.fullName);
    },
    book_5_events: async () => {
      const count = await achievementsRepository.countRegistrations(userId);
      return count >= 5;
    },
  };

  const check = checks[actionType];
  if (!check) return granted;

  const met = await check();
  if (!met) return granted;

  const achievements = await achievementsRepository.findByCriteria(actionType);
  for (const ach of achievements) {
    const wasGranted = await achievementsRepository.grantToUser(userId, ach.id);
    if (wasGranted) {
      granted.push(ach);
    }
  }

  return granted;
};
