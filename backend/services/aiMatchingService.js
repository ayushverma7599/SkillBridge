
class AIMatchingService {
  // Calculate skill match percentage
  calculateSkillMatch(userSkills, projectSkills) {
    if (!userSkills || !projectSkills) return 0;
    
    const userSkillsArray = typeof userSkills === 'string' ? JSON.parse(userSkills) : userSkills;
    const projectSkillsArray = typeof projectSkills === 'string' ? JSON.parse(projectSkills) : projectSkills;
    
    if (!userSkillsArray.length || !projectSkillsArray.length) return 0;

    const matchingSkills = userSkillsArray.filter(skill => 
      projectSkillsArray.some(ps => ps.toLowerCase().includes(skill.toLowerCase()))
    );

    return (matchingSkills.length / projectSkillsArray.length) * 100;
  }

  // Calculate budget compatibility
  calculateBudgetScore(userExperience, projectBudget) {
    const experienceMultiplier = (userExperience || 1) / 5;
    return Math.min((projectBudget / 10000) * experienceMultiplier, 100);
  }

  // Get recommended projects for user
  async getRecommendedProjects(user, allProjects) {
    const scoredProjects = allProjects.map(project => {
      const skillScore = this.calculateSkillMatch(user.skills, project.skills);
      const budgetScore = this.calculateBudgetScore(user.experienceYears, project.budget);
      
      const totalScore = (skillScore * 0.7) + (budgetScore * 0.3);

      return {
        ...project.toJSON(),
        matchScore: Math.round(totalScore)
      };
    });

    return scoredProjects
      .filter(p => p.matchScore > 30)
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}

module.exports = new AIMatchingService();
