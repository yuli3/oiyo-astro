export const getRouteSuggestions = (
  pathname: string,
): { href: string; label: string }[] => {
  const suggestions = [
    { href: "/", label: "Home" },
    { href: "/ontology/fortune", label: "Daily Fortune" },
    { href: "/ontology/test", label: "Personality Test" },
  ];

  // Logic to filter or reorder based on pathname can be added here
  // For now, returning static most popular links as "Contextual Recovery"
  return suggestions;
};
