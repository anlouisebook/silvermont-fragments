/* Silvermont: Fragments v0.8.0 */
const STORY = {
  prologue: [
    { speaker: "Narrator", text: "You arrived in Silvermont." },
    { speaker: "Narrator", text: "At eight years old, your new life is measured in school days, quiet rooms, and the weight of Mother's Necklace against your chest." },
    { speaker: "Narrator", text: "Most days will be ordinary. Some will not." }
  ],
  events: {
    major: LIFE_MAJOR_EVENTS,
    minor: {
      ...LIFE_HOME_EVENTS,
      ...LIFE_SOCIAL_EVENTS,
      ...LIFE_WORLD_EVENTS
    }
  }
};

const ACTIVITIES = [
  { id: "study", name: "Study", stat: "Intelligence", gain: 2, note: "+Intelligence" },
  { id: "exercise", name: "Exercise", stat: "Fitness", gain: 2, note: "+Fitness" },
  { id: "socialize", name: "Socialize", stat: "Charisma", gain: 2, note: "+Charisma" },
  { id: "create", name: "Draw & Create", stat: "Creativity", gain: 2, note: "+Creativity" },
  { id: "help", name: "Help at Home", stat: "Kindness", gain: 2, note: "+Kindness" }
];
