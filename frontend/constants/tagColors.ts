export const tagColors = [
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#FF9800", // Orange
  "#9C27B0", // Purple
  "#FF5722", // Deep Orange
  "#673AB7", // Deep Purple
  "#009688", // Teal
  "#E91E63", // Pink
  "#3F51B5", // Indigo
  "#FFC107", // Amber
  "#607D8B", // Blue Gray
  "#8BC34A", // Light Green
  "#CDDC39", // Lime
  "#F44336", // Red
  "#0288D1", // Light Blue
];

export const getTagColor = (courseTag: string) => {
  const hash = courseTag
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tagColors[hash % tagColors.length];
};
