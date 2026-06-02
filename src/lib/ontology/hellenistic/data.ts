export const HELLENISTIC_PRINCIPLES = [
  {
    descriptionKey: "principles.sect.description",
    principles: [
      {
        condition: "Sun is above the horizon",
        rulers: ["Sun", "Jupiter", "Saturn"],
        type: "diurnal",
      },
      {
        condition: "Sun is below the horizon",
        rulers: ["Moon", "Venus", "Mars"],
        type: "nocturnal",
      },
    ],
    termKey: "principles.sect.term",
  },
  {
    descriptionKey: "principles.essential_dignity.description",
    termKey: "principles.essential_dignity.term",
  },
  {
    descriptionKey: "principles.lot_of_fortune.description",
    formula: {
      day: "Asc + Moon - Sun",
      night: "Asc + Sun - Moon",
    },
    termKey: "principles.lot_of_fortune.term",
  },
];

export const TRIPLICITY_LORDS = {
  Air: {
    Day: ["Saturn", "Mercury"],
    Night: ["Mercury", "Saturn"],
    Part: "Jupiter",
  },
  Earth: {
    Day: ["Venus", "Moon"],
    Night: ["Moon", "Venus"],
    Part: "Mars",
  },
  Fire: {
    Day: ["Sun", "Jupiter"],
    Night: ["Jupiter", "Sun"],
    Part: "Saturn",
  },
  Water: {
    Day: ["Venus", "Mars"],
    Night: ["Mars", "Venus"],
    Part: "Moon",
  },
};

export const PLANETARY_SYMBOLS: Record<string, string> = {
  Jupiter: "♃",
  Mars: "♂",
  Mercury: "☿",
  Moon: "☽",
  Saturn: "♄",
  Sun: "☉",
  Venus: "♀",
};
