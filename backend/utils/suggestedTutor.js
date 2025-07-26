const { COURSES } = require("../config/constants");

function computeMatchScore(student, tutor, tutorProfile) {
  const moduleScore =
    0.3 * (student.major == tutor.major ? 1 : 0) +
    0.7 * COURSES[student.major].includes(tutorProfile.course);
  const ratingScore = tutor.ratings / 5;
  const modeScore =
    tutorProfile.location == student.preferredMode
      ? 1
      : tutorProfile.location == "hybrid" || student.preferredMode == "hybrid"
        ? 0.5
        : 0;
  const budgetScore =
    tutorProfile.rate <= student.budgetCap
      ? 1
      : Math.max(
          0,
          1 - (tutorProfile.rate - student.budgetCap) / student.budgetCap,
        );

  return (
    0.5 * moduleScore +
    0.25 * ratingScore +
    0.15 * budgetScore +
    0.1 * modeScore
  );
}

module.exports = { computeMatchScore };
