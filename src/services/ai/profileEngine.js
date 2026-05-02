/**
 * User Profile Engine
 * Loads and applies user profile constraints to AI prompts
 */

import { userProfileRepo } from '../storage/db';

let _cachedProfile = null;

export const profileEngine = {
  async loadProfile() {
    const profile = userProfileRepo.get();
    if (profile) {
      _cachedProfile = {
        ...profile,
        preferredTags: profile.preferredTags ? JSON.parse(profile.preferredTags) : [],
        avoidWords: profile.avoidWords ? JSON.parse(profile.avoidWords) : [],
        favoriteExpressions: profile.favoriteExpressions
          ? JSON.parse(profile.favoriteExpressions)
          : [],
        constraints: profile.constraints ? JSON.parse(profile.constraints) : {},
      };
    } else {
      _cachedProfile = null;
    }
    return _cachedProfile;
  },

  getProfile() {
    return _cachedProfile;
  },

  invalidateCache() {
    _cachedProfile = null;
  },

  applyConstraints(prompt, type) {
    const profile = _cachedProfile;
    if (!profile) return prompt;

    const constraints = profile.constraints || {};

    switch (type) {
      case 'title':
        return `${prompt}\n\n约束：${constraints.titleStyle || '简洁有力，使用动词开头'}`;
      case 'summary':
        return `${prompt}\n\n约束：${constraints.summaryStyle || '2-3句话，包含核心观点和行动建议'}`;
      case 'tags':
        return `${prompt}\n\n约束：${constraints.tagStyle || '优先使用已建立的标签体系，新标签需有明确语义'}`;
      default:
        return prompt;
    }
  },
};

export default profileEngine;
