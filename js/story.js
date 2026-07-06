/* Silvermont: Fragments v0.7.0
   Changelog:
   - Replaced fixed week stories with reusable major/minor event dictionaries.
   - Major events preserve plot order through prerequisites but trigger on randomized eligible days.
   - Events are tagged weekday/weekend/both to prevent context-invalid scheduling.
   - Weekly event limits are enforced by the runtime: max 1 major and 2 minor, with zero allowed.
*/

const STORY = {
  prologue: [
    { speaker: "Narrator", text: "The first thing you remember is your mother's necklace cutting into your palm." },
    { speaker: "Mother", portrait: { character: "mother", emotion: "afraid" }, text: "{nickname}, look at me. If you ever see the blue bird—" },
    { speaker: "Narrator", text: "Headlights bloom where the road should be." },
    { speaker: "Mother", portrait: { character: "mother", emotion: "afraid" }, text: "Not the name. The mark." },
    { speaker: "Narrator", text: "Metal screams. Your mother's hand reaches across the dark. Then your memory tears itself in half." },
    { speaker: "Narrator", text: "Weeks later, you wake in a bedroom that still smells new." },
    { speaker: "Agnes Cole", portrait: { character: "agnes", emotion: "concerned" }, text: "Easy, little bird. You were counting backward in your sleep again." },
    { speaker: "Narrator", text: "Outside the window, Whitmore Estates is all clipped hedges, quiet roads, and houses too large to feel accidental." },
    { speaker: "Dorian Evans", portrait: { character: "dorian", emotion: "gentle" }, text: "First day at Silvermont Academy soon. You don't have to be brave for me, okay?" },
    { speaker: "Narrator", text: "Dorian Evans is twenty-three, your mother's younger brother, and now your legal guardian. He says 'safe' too often for the word to feel simple." },
    { speaker: "Narrator", text: "At breakfast, Dorian's phone lights up. He turns it face down before you can read more than two words: LEGACY ACCESS." },
    { speaker: "Narrator", text: "Your fingers close around the necklace. The clasp gives a tiny metallic click." }
  ],

  events: {
    major: {
      new_life: {
        id: "new_life",
        type: "major",
        dayType: "weekday",
        order: 1,
        minDay: 0,
        maxDay: 6,
        guaranteedBy: 4,
        chance: 0.42,
        effects: { flags: { major_new_life: true } },
        scenes: [
          { speaker: "Narrator", text: "Silvermont Academy welcomes new students with polished floors, navy uniforms, and a bell loud enough to shake loose a memory." },
          { speaker: "Narrator", text: "For one breath, the classroom becomes wet glass and red light." },
          { speaker: "Fern Holloway", portrait: { character: "fern", emotion: "concerned" }, text: "Hey. You dropped your pencil." },
          { speaker: "Narrator", text: "Fern Holloway places it beside your hand without asking why you froze. Five minutes later, she slides you a hand-drawn map of the school." },
          { speaker: "Fern Holloway", portrait: { character: "fern", emotion: "happy" }, text: "Library, nurse, exits, and the vending machine that steals coins. I believe in useful information." },
          { speaker: "Narrator", text: "Later, near the Whitmore Estates playground, a boy in an immaculate uniform watches the road instead of the game." },
          { speaker: "Ethan Blackwell", portrait: { character: "ethan", emotion: "guarded" }, text: "You're Lilianna Evans. House fourteen." },
          { speaker: "Narrator", text: "Your stomach tightens. You never told him your name." },
          { speaker: "Ethan Blackwell", portrait: { character: "ethan", emotion: "serious" }, text: "The estate directory is public to residents. It shouldn't be, but it is." },
          { speaker: "Narrator", text: "A ball rolls toward the road. Ethan catches your sleeve before a delivery van cuts around the corner." },
          { speaker: "Ethan Blackwell", portrait: { character: "ethan", emotion: "tense" }, text: "Look first. People assume quiet roads are safe." },
          {
            speaker: "Narrator",
            text: "Two strangers have offered you two very different kinds of trust.",
            choices: [
              { text: "Ask Fern to show you the library", effect: { stat: "Kindness", amount: 1, flag: "fern_seed", relationship: { key: "fern", amount: 1 } } },
              { text: "Ask Ethan why he watches the road", effect: { stat: "Charisma", amount: 1, flag: "ethan_seed", relationship: { key: "ethan", amount: 1 } } }
            ]
          }
        ]
      },

      violin_secret: {
        id: "violin_secret",
        type: "major",
        dayType: "weekday",
        order: 2,
        minDay: 4,
        maxDay: 14,
        guaranteedBy: 11,
        chance: 0.34,
        requirements: { flagsAll: ["major_new_life"] },
        effects: { flags: { major_violin_secret: true } },
        scenes: [
          { speaker: "Narrator", text: "A violin phrase drifts through an unused music corridor at Silvermont Academy." },
          { speaker: "Narrator", text: "You follow it to a half-open door." },
          { speaker: "Narrator", text: "Inside, Ethan stands with a violin under his chin. For once, he looks completely unguarded." },
          { speaker: "Ethan Blackwell", portrait: { character: "ethan", emotion: "afraid" }, text: "You didn't hear anything." },
          { speaker: "Narrator", text: "The fear in his face is sharper than embarrassment." },
          { speaker: "Narrator", text: "That evening, Agnes burns the toast." },
          { speaker: "Agnes Cole", portrait: { character: "agnes", emotion: "nostalgic" }, text: "Your mother used to do that. She'd scrape off the black bits and call it rustic." },
          { speaker: "Narrator", text: "Dorian's coffee cup stops halfway to his mouth." },
          { speaker: "Dorian Evans", portrait: { character: "dorian", emotion: "tense" }, text: "Agnes. Not yet." },
          { speaker: "Narrator", text: "Later, passing Dorian's study, you hear his voice through the door." },
          { speaker: "Dorian Evans", portrait: { character: "dorian", emotion: "serious" }, text: "I closed that access path years ago. If someone is touching the old architecture, I need the logs before they know she survived." },
          {
            speaker: "Narrator",
            text: "The floorboard creaks beneath your foot. Silence answers from the study.",
            choices: [
              { text: "Ask Dorian what 'she survived' means", effect: { stat: "Charisma", amount: 1, flag: "confronted_dorian", relationship: { key: "dorian", amount: -1 } } },
              { text: "Find Agnes and repeat what you heard", effect: { stat: "Kindness", amount: 1, flag: "trusted_agnes", relationship: { key: "agnes", amount: 1 } } }
            ]
          }
        ]
      },

      storm_memory: {
        id: "storm_memory",
        type: "major",
        dayType: "both",
        order: 3,
        minDay: 10,
        maxDay: 22,
        guaranteedBy: 18,
        chance: 0.3,
        requirements: { flagsAll: ["major_violin_secret"] },
        effects: { flags: { major_storm_memory: true } },
        scenes: [
          { speaker: "Narrator", text: "A hard September storm reaches Silvermont after dark." },
          { speaker: "Narrator", text: "Power dies. Somewhere downstairs, Dorian swears. Agnes lights a candle." },
          { speaker: "Agnes Cole", portrait: { character: "agnes", emotion: "gentle" }, text: "Stay with my voice, little bird." },
          { speaker: "Narrator", text: "Lightning turns the window white. The necklace goes cold against your skin." },
          { speaker: "Mother", portrait: { character: "mother", emotion: "afraid" }, text: "If I can't come back, follow the bird. Not the name—the mark." },
          { speaker: "Narrator", text: "A route map flashes in your mind. A blue bird symbol blinks beside a line of coordinates." },
          { speaker: "Unknown Voice", text: "Confirm the child is still with her." },
          { speaker: "Narrator", text: "The memory jumps. Your mother's hand slams a laptop shut. A tiny blue bird is printed on a black access card." },
          { speaker: "Narrator", text: "You wake on the floor with Agnes calling your name and Dorian staring at the necklace." },
          { speaker: "Dorian Evans", portrait: { character: "dorian", emotion: "afraid" }, text: "What did you remember?" },
          { speaker: "Narrator", text: "He asks too quickly." },
          {
            speaker: "Narrator",
            text: "The fragment is incomplete. It may even be wrong.",
            choices: [
              { text: "Write every detail in a private journal", effect: { stat: "Intelligence", amount: 1, flag: "journal_blue_bird" } },
              { text: "Tell Fern about the symbol, but not the crash", effect: { stat: "Creativity", amount: 1, flag: "fern_blue_bird", relationship: { key: "fern", amount: 1 } } }
            ]
          },
          { speaker: "Narrator", text: "Before dawn, you notice mud on the back step. One adult-sized shoe print. None leading away." }
        ]
      },

      gray_car: {
        id: "gray_car",
        type: "major",
        dayType: "weekday",
        order: 4,
        minDay: 18,
        maxDay: 27,
        guaranteedBy: 26,
        chance: 0.28,
        requirements: { flagsAll: ["major_storm_memory"] },
        effects: { flags: { major_gray_car: true } },
        scenes: [
          { speaker: "Fern Holloway", portrait: { character: "fern", emotion: "concerned" }, text: "Don't turn around yet. The gray car across from the gate was here yesterday." },
          { speaker: "Ethan Blackwell", portrait: { character: "ethan", emotion: "serious" }, text: "Three days. Same plate frame. Same dent near the rear light." },
          { speaker: "Fern Holloway", portrait: { character: "fern", emotion: "concerned" }, text: "You memorized that?" },
          { speaker: "Ethan Blackwell", portrait: { character: "ethan", emotion: "guarded" }, text: "Cars don't idle outside a school for three days by accident." },
          { speaker: "Narrator", text: "That afternoon, the gray car follows Agnes's route into Whitmore Estates, then disappears before the security gate." },
          { speaker: "Agnes Cole", portrait: { character: "agnes", emotion: "tense" }, text: "Inside. Both locks. Now." },
          { speaker: "Narrator", text: "Dorian is not home. His study door is open." },
          { speaker: "Narrator", text: "A notification flashes across his unattended laptop: LEGACY ACCESS PATH ACTIVE — EVANS TRACE RESTORED." },
          { speaker: "Narrator", text: "The house lights flicker. Outside, the gray car rolls to a stop across the street." },
          { speaker: "Dorian Evans", portrait: { character: "dorian", emotion: "afraid" }, text: "{nickname}... step away from the window." },
          { speaker: "Narrator", text: "You did not hear him come in." },
          { speaker: "Dorian Evans", portrait: { character: "dorian", emotion: "tense" }, text: "I thought I buried that path." },
          { speaker: "Narrator", text: "His phone begins to ring. The screen shows no number—only a blue bird with a broken left wing." },
          { speaker: "Dorian Evans", portrait: { character: "dorian", emotion: "afraid" }, text: "They shouldn't know you're here." },
          { speaker: "Narrator", text: "For the first time, you understand that Dorian is not only hiding the past. He has been waiting for it to find you." }
        ]
      }
    },

    minor: {
      birthday: {
        id: "birthday",
        type: "minor",
        dayType: "both",
        special: "birthday",
        minDay: 0,
        maxDay: 27,
        chance: 1,
        effects: { stats: { Charisma: 1, Kindness: 1 }, flags: { birthday_event_seen: true }, birthdayCelebrated: true },
        scenes: [
          { speaker: "Narrator", text: "{birthdayLabel} arrives in the middle of a life that still does not quite feel like yours." },
          { speaker: "Agnes Cole", portrait: { character: "agnes", emotion: "happy" }, text: "Happy birthday, {firstName}. I negotiated with your uncle. No speeches longer than thirty seconds." },
          { speaker: "Dorian Evans", portrait: { character: "dorian", emotion: "gentle" }, text: "Twenty-eight seconds, actually. I timed it." },
          { speaker: "Narrator", text: "You laugh before you can stop yourself. For one evening, grief makes room for something warmer." }
        ]
      },

      fern_library: {
        id: "fern_library",
        type: "minor",
        dayType: "weekday",
        minDay: 1,
        maxDay: 24,
        chance: 0.22,
        requirements: { flagsAll: ["major_new_life"] },
        effects: { relationships: { fern: 1 }, stats: { Intelligence: 1 } },
        scenes: [
          { speaker: "Fern Holloway", portrait: { character: "fern", emotion: "happy" }, text: "I found the one table the librarian can't see from the desk. For academic reasons." },
          { speaker: "Narrator", text: "An hour of whispered study turns into an easy friendship ritual. (+1 Intelligence)" }
        ]
      },

      ethan_privacy: {
        id: "ethan_privacy",
        type: "minor",
        dayType: "weekday",
        minDay: 2,
        maxDay: 25,
        chance: 0.18,
        requirements: { flagsAll: ["major_new_life"] },
        effects: { relationships: { ethan: 1 }, stats: { Charisma: 1 } },
        scenes: [
          { speaker: "Ethan Blackwell", portrait: { character: "ethan", emotion: "guarded" }, text: "Your school profile shows your birthday by default." },
          { speaker: "Narrator", text: "He shows you how to hide it, then pretends the favor meant nothing. (+1 Charisma)" }
        ]
      },

      agnes_kitchen: {
        id: "agnes_kitchen",
        type: "minor",
        dayType: "both",
        minDay: 0,
        maxDay: 27,
        chance: 0.2,
        effects: { relationships: { agnes: 1 }, stats: { Kindness: 1 } },
        scenes: [
          { speaker: "Agnes Cole", portrait: { character: "agnes", emotion: "happy" }, text: "If you can stir without redecorating the ceiling, you're hired." },
          { speaker: "Narrator", text: "You help with dinner. Agnes tells no secrets, but the house feels less borrowed. (+1 Kindness)" }
        ]
      },

      pop_quiz: {
        id: "pop_quiz",
        type: "minor",
        dayType: "weekday",
        minDay: 1,
        maxDay: 27,
        chance: 0.17,
        effects: { stats: { Intelligence: 1 } },
        scenes: [
          { speaker: "Narrator", text: "A surprise quiz lands on your desk before lunch." },
          { speaker: "Narrator", text: "You catch one trick question before handing it in. (+1 Intelligence)" }
        ]
      },

      sketchbook_trade: {
        id: "sketchbook_trade",
        type: "minor",
        dayType: "weekday",
        minDay: 3,
        maxDay: 27,
        chance: 0.16,
        requirements: { flagsAll: ["major_new_life"] },
        effects: { relationships: { fern: 1 }, stats: { Creativity: 1 } },
        scenes: [
          { speaker: "Fern Holloway", portrait: { character: "fern", emotion: "happy" }, text: "One page each. No judging until both drawings are done." },
          { speaker: "Narrator", text: "Her terrible dragon makes you laugh hard enough to ruin your own sketch. (+1 Creativity)" }
        ]
      },

      rainy_walk: {
        id: "rainy_walk",
        type: "minor",
        dayType: "weekday",
        minDay: 5,
        maxDay: 27,
        chance: 0.14,
        effects: { stats: { Fitness: 1 } },
        scenes: [
          { speaker: "Narrator", text: "A sudden shower traps everyone under the academy awning." },
          { speaker: "Narrator", text: "You decide to run for the gate. By the time you reach it, your shoes are soaked and you are grinning. (+1 Fitness)" }
        ]
      },

      club_discovery: {
        id: "club_discovery",
        type: "minor",
        dayType: "weekday",
        minDay: 4,
        maxDay: 20,
        chance: 0.2,
        requirements: { flagsAll: ["major_new_life"] },
        effects: { stats: { Creativity: 1 } },
        scenes: [
          { speaker: "Narrator", text: "Club discovery day turns the gym into a maze of handmade signs and aggressive enthusiasm." },
          { speaker: "Fern Holloway", portrait: { character: "fern", emotion: "happy" }, text: "Book club has biscuits. Science club has a smoke alarm incident. I am keeping an open mind." },
          { speaker: "Narrator", text: "You leave with three flyers and one new idea. (+1 Creativity)" }
        ]
      },

      studious_school: {
        id: "studious_school",
        type: "minor",
        dayType: "weekday",
        minDay: 1,
        maxDay: 27,
        chance: 0.24,
        requirements: { positiveTraitsAny: ["Studious"], flagsAll: ["major_new_life"] },
        effects: { relationships: { fern: 1 }, stats: { Intelligence: 1 } },
        scenes: [
          { speaker: "Fern Holloway", portrait: { character: "fern", emotion: "happy" }, text: "You annotated the orientation sheet? I knew there was a reason I liked you." },
          { speaker: "Narrator", text: "Your Studious trait turns an awkward pause into an easy conversation. (+1 Intelligence)" }
        ]
      },

      anxious_grounding: {
        id: "anxious_grounding",
        type: "minor",
        dayType: "both",
        minDay: 2,
        maxDay: 27,
        chance: 0.24,
        requirements: { emotionalStates: ["Anxious"] },
        effects: { relationships: { agnes: 1 }, stats: { Kindness: 1 } },
        scenes: [
          { speaker: "Agnes Cole", portrait: { character: "agnes", emotion: "gentle" }, text: "Five things you can see. Four you can touch. We don't fight the fear all at once." },
          { speaker: "Narrator", text: "Agnes notices before you have to ask. (+1 Kindness)" }
        ]
      },

      whitmore_market: {
        id: "whitmore_market",
        type: "minor",
        dayType: "weekend",
        minDay: 5,
        maxDay: 27,
        chance: 0.16,
        effects: { relationships: { agnes: 1 }, stats: { Charisma: 1 } },
        scenes: [
          { speaker: "Narrator", text: "Whitmore Estates opens its small weekend market beside the community garden." },
          { speaker: "Agnes Cole", portrait: { character: "agnes", emotion: "happy" }, text: "One rule: if a vendor offers a sample, we are morally obligated to investigate." },
          { speaker: "Narrator", text: "You practice small talk over fruit stalls and leave carrying too many pastries. (+1 Charisma)" }
        ]
      },

      curious_memory: {
        id: "curious_memory",
        type: "minor",
        dayType: "both",
        minDay: 12,
        maxDay: 27,
        chance: 0.2,
        requirements: { emotionalStates: ["Curious"], flagsAll: ["major_storm_memory"] },
        effects: { stats: { Intelligence: 1 }, flags: { noticed_broken_wing: true } },
        scenes: [
          { speaker: "Narrator", text: "Curiosity keeps you awake. You redraw the blue bird mark three times before the edges blur." },
          { speaker: "Narrator", text: "The third sketch includes a tiny break in the left wing. You are certain the first two did not. (+1 Intelligence)" }
        ]
      }
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
