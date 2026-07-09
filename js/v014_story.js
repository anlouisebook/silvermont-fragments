"use strict";
(function () {
  const events = STORY.events;
  const minor = events.minor;
  const major = events.major;

  function event(id) { return major[id] || minor[id] || null; }

  // Choice Memory requirements for story callbacks.
  const previousRequirementMet = window.GameCore.eventRequirementMet;
  window.GameCore.eventRequirementMet = function (target, stateArg) {
    if (!previousRequirementMet(target, stateArg)) return false;
    const req = target?.requirements || {};
    const memory = Array.isArray(stateArg?.choiceMemory) ? stateArg.choiceMemory : [];
    const matches = (rule) => memory.some((item) =>
      (!rule.eventId || item.eventId === rule.eventId) &&
      (!rule.choice || item.choice === rule.choice)
    );
    if (Array.isArray(req.choiceMemoryAny) && req.choiceMemoryAny.length && !req.choiceMemoryAny.some(matches)) return false;
    if (Array.isArray(req.choiceMemoryAll) && req.choiceMemoryAll.length && !req.choiceMemoryAll.every(matches)) return false;
    return true;
  };

  // Exact-date school story. It may fall forward if a higher-priority mystery beat wins that day.
  major.school_founders_assembly = {
    id: "school_founders_assembly",
    type: "major",
    name: "Founders' Assembly",
    triggerDate: { month: 9, day: 16 },
    dayType: "weekday",
    activityTags: ["any"],
    priority: 92,
    effects: { flags: { founders_assembly_seen: true } },
    scenes: [
      { speaker: "Narrator", text: "The academy auditorium smells faintly of dust, polished wood, and too many uniforms pressed into one room." },
      { speaker: "Fern Holloway", text: "Founders' Assembly. Every year they tell us the school was built on discipline, service, and excellent handwriting.", portrait: { character: "fern", emotion: "neutral" } },
      { speaker: "{firstName}", text: "Was it?" },
      { speaker: "Fern Holloway", text: "The handwriting part is probably true.", portrait: { character: "fern", emotion: "happy" } },
      { speaker: "Narrator", text: "A glass case beside the stage displays old programs, photographs, and a tarnished brass plaque." },
      { speaker: "Narrator", text: "One printed catalog number catches your eye: M-17." },
      { speaker: "Narrator", text: "The same shape of characters hidden inside Mother's Necklace." },
      { speaker: "Narrator", text: "Your pulse jumps.", choices: [
        { text: "Copy the catalog number quietly.", effect: { flags: { assembly_m17_noticed: true }, delayedConsequences: [{ id: "assembly_program_memory", delayDays: 2, effects: { flags: { assembly_program_recalled: true } }, message: "You remember where the M-17 catalog number appeared during the assembly." }] }, scenes: [
          { speaker: "Narrator", text: "You write M-17 on the edge of your program and fold the paper twice." }
        ]},
        { text: "Ask Fern what M-17 means.", effect: { relationships: { fern: 1 }, flags: { assembly_m17_noticed: true, fern_knows_about_m17: true } }, scenes: [
          { speaker: "{firstName}", text: "Fern. Does M-17 mean anything here?" },
          { speaker: "Fern Holloway", text: "Catalog code, maybe. Why?", portrait: { character: "fern", emotion: "concerned" } },
          { speaker: "{firstName}", text: "I don't know yet." }
        ]},
        { text: "Ignore it for now.", effect: { flags: { assembly_m17_ignored: true } }, scenes: [
          { speaker: "Narrator", text: "You look away. The number follows you anyway." }
        ]}
      ]},
      { speaker: "Narrator", text: "On stage, the headmaster begins speaking about history. For once, you are listening for the parts he does not say." }
    ]
  };

  // Accident chain continuation: uses chain order, activity tags, priority, journal flags, and delayed callbacks.
  major.mystery_archive_receipt = {
    id: "mystery_archive_receipt",
    type: "major",
    name: "The Archive Receipt",
    dayType: "weekday",
    minDay: 14,
    chance: 0.32,
    activityTags: ["study", "create"],
    chainId: "accident_fragments_chain",
    chainStep: 3,
    priority: 105,
    requirements: { flagsAll: ["found_hospital_timeline_gap"] },
    effects: { flags: { archive_receipt_found: true } },
    scenes: [
      { speaker: "Narrator", text: "A library book slips from the return cart and lands open at your feet." },
      { speaker: "Narrator", text: "Inside the back cover is an old checkout receipt, too faded to belong to the current system." },
      { speaker: "Narrator", text: "The header reads: MUNICIPAL ARCHIVE — RESTRICTED COPY." },
      { speaker: "Narrator", text: "Below it, someone wrote 04:20 by hand." },
      { speaker: "{firstName}", text: "No." },
      { speaker: "Narrator", text: "The number from the necklace. The time missing from the hospital record." },
      { speaker: "Narrator", text: "Three things should not agree by accident.", choices: [
        { text: "Copy every number before returning the receipt.", effect: { flags: { archive_numbers_copied: true }, delayedConsequences: [{ id: "anonymous_envelope_arrives", delayDays: 3, effects: { flags: { anonymous_envelope_arrived: true } }, message: "An unmarked envelope appears among the morning mail." }] }, scenes: [
          { speaker: "Narrator", text: "You copy the archive code, date, and handwritten time into the back of your notebook." }
        ]},
        { text: "Show the receipt to Fern.", effect: { relationships: { fern: 2 }, flags: { archive_numbers_copied: true, fern_saw_archive_receipt: true }, delayedConsequences: [{ id: "fern_checks_archive_code", delayDays: 4, effects: { flags: { fern_checked_archive_code: true } }, message: "Fern quietly confirms that the archive code belongs to an old municipal collection." }] }, scenes: [
          { speaker: "Fern Holloway", text: "This is not a school code.", portrait: { character: "fern", emotion: "serious" } },
          { speaker: "{firstName}", text: "I was afraid you'd say that." }
        ]},
        { text: "Put it back and remember the place.", effect: { flags: { archive_receipt_location_remembered: true } }, scenes: [
          { speaker: "Narrator", text: "You return the receipt exactly where you found it. Evidence can disappear when people know you noticed it." }
        ]}
      ]},
      { speaker: "Narrator", text: "The library suddenly feels less quiet and more watched." }
    ]
  };

  major.mystery_anonymous_envelope = {
    id: "mystery_anonymous_envelope",
    type: "major",
    name: "No Return Address",
    dayType: "both",
    minDay: 17,
    chance: 1,
    activityTags: ["any"],
    priority: 110,
    prerequisiteEvents: ["mystery_archive_receipt"],
    requirements: { flagsAll: ["anonymous_envelope_arrived"] },
    effects: { flags: { anonymous_envelope_opened: true, truth_story_does_not_fit: true } },
    scenes: [
      { speaker: "Narrator", text: "The envelope has no stamp, no return address, and your name typed in block letters." },
      { speaker: "Agnes Cole", text: "That was not with the post when I checked earlier.", portrait: { character: "agnes", emotion: "concerned" } },
      { speaker: "Narrator", text: "Inside is a photocopy of a road diagram." },
      { speaker: "Narrator", text: "One intersection is circled. Beside it: 04:20." },
      { speaker: "Narrator", text: "At the bottom, a single sentence: THE STORY THEY GAVE YOU STARTS TOO LATE." },
      { speaker: "{firstName}", text: "Someone knows." },
      { speaker: "Narrator", text: "The frightening part is not that someone knows. It is that someone knows you are looking." }
    ]
  };

  // Relationship-threshold continuations.
  minor.ethan_unfinished_question = {
    id: "ethan_unfinished_question",
    type: "minor",
    name: "The Unfinished Question",
    dayType: "both",
    minDay: 21,
    chance: 0.26,
    activityTags: ["socialize", "exercise"],
    chainId: "ethan_intro_chain",
    chainStep: 3,
    priority: 74,
    requirements: { relationshipMin: { ethan: 12 } },
    effects: { relationships: { ethan: 2 } },
    scenes: [
      { speaker: "Narrator", text: "Ethan is already on the left swing when you arrive." },
      { speaker: "Ethan Blackwell", text: "I saved it.", portrait: { character: "ethan", emotion: "neutral" } },
      { speaker: "{firstName}", text: "The swing?" },
      { speaker: "Ethan Blackwell", text: "You said it was yours.", portrait: { character: "ethan", emotion: "guarded" } },
      { speaker: "Narrator", text: "You do not remember saying that. You remember wanting to." },
      { speaker: "Ethan Blackwell", text: "Can I ask you something?", portrait: { character: "ethan", emotion: "serious" } },
      { speaker: "{firstName}", text: "You just did." },
      { speaker: "Narrator", text: "He gives you a look. Then, unexpectedly, laughs." },
      { speaker: "Ethan Blackwell", text: "Fine. Another thing. Why do you always touch that necklace when you're scared?", portrait: { character: "ethan", emotion: "concerned" }, choices: [
        { text: "Tell him it belonged to your mother.", effect: { relationships: { ethan: 2 }, flags: { ethan_knows_necklace_belonged_to_mother: true } }, scenes: [
          { speaker: "{firstName}", text: "It was my mother's." },
          { speaker: "Ethan Blackwell", text: "Oh.", portrait: { character: "ethan", emotion: "concerned" } },
          { speaker: "Narrator", text: "He does not say he is sorry. Somehow, that is kinder." }
        ]},
        { text: "Say you're not ready to explain.", effect: { relationships: { ethan: 1 }, flags: { ethan_respected_boundary: true } }, scenes: [
          { speaker: "{firstName}", text: "I can't explain it yet." },
          { speaker: "Ethan Blackwell", text: "Then don't.", portrait: { character: "ethan", emotion: "gentle" } }
        ]}
      ]},
      { speaker: "Narrator", text: "The question remains unfinished, but it no longer feels dangerous between you." }
    ]
  };

  minor.ethan_choice_memory_callback = {
    id: "ethan_choice_memory_callback",
    type: "minor",
    name: "The Space Beside Him",
    dayType: "both",
    minDay: 21,
    chance: 0.22,
    activityTags: ["socialize"],
    priority: 79,
    prerequisiteEvents: ["ethan_playground_friendship"],
    requirements: {
      relationshipMin: { ethan: 14 },
      choiceMemoryAny: [{ eventId: "ethan_second_meeting", choice: "Ask if you can sit with him." }]
    },
    effects: { relationships: { ethan: 2 }, flags: { ethan_choice_memory_paid_off: true } },
    scenes: [
      { speaker: "Narrator", text: "Ethan moves his book before you ask, leaving the space beside him open." },
      { speaker: "Ethan Blackwell", text: "You can sit. You always ask first.", portrait: { character: "ethan", emotion: "gentle" } },
      { speaker: "Narrator", text: "He remembered." },
      { speaker: "{firstName}", text: "What if I stopped asking?" },
      { speaker: "Ethan Blackwell", text: "Then I would probably still move the book.", portrait: { character: "ethan", emotion: "happy" } }
    ]
  };

  minor.fern_margin_promise = {
    id: "fern_margin_promise",
    type: "minor",
    name: "Notes in the Margin",
    dayType: "weekday",
    minDay: 21,
    chance: 0.26,
    activityTags: ["study", "socialize"],
    chainId: "fern_intro_chain",
    chainStep: 3,
    priority: 74,
    requirements: { relationshipMin: { fern: 12 } },
    effects: { relationships: { fern: 2 } },
    scenes: [
      { speaker: "Fern Holloway", text: "I changed my system.", portrait: { character: "fern", emotion: "serious" } },
      { speaker: "{firstName}", text: "That sounds serious." },
      { speaker: "Fern Holloway", text: "It is.", portrait: { character: "fern", emotion: "neutral" } },
      { speaker: "Narrator", text: "She shows you a notebook. The margins are filled with tiny questions instead of perfect summaries." },
      { speaker: "Fern Holloway", text: "I realized I keep writing what I know and hiding what I don't.", portrait: { character: "fern", emotion: "concerned" }, choices: [
        { text: "Add one of your own questions.", effect: { relationships: { fern: 2 }, flags: { fern_shared_uncertainty: true } }, scenes: [
          { speaker: "Narrator", text: "You write: Why does M-17 keep appearing?" },
          { speaker: "Fern Holloway", text: "That is a very alarming first contribution.", portrait: { character: "fern", emotion: "concerned" } }
        ]},
        { text: "Tell her uncertainty is useful.", effect: { relationships: { fern: 1 }, flags: { fern_accepts_uncertainty: true } }, scenes: [
          { speaker: "{firstName}", text: "Questions show where to look next." },
          { speaker: "Fern Holloway", text: "I am trying to believe that.", portrait: { character: "fern", emotion: "gentle" } }
        ]}
      ]},
      { speaker: "Narrator", text: "For the first time, Fern's notes look less perfect and more honest." }
    ]
  };

  minor.fern_choice_memory_callback = {
    id: "fern_choice_memory_callback",
    type: "minor",
    name: "The Study Table",
    dayType: "weekday",
    minDay: 21,
    chance: 0.22,
    activityTags: ["study"],
    priority: 79,
    prerequisiteEvents: ["fern_shared_notes"],
    requirements: {
      relationshipMin: { fern: 14 },
      choiceMemoryAny: [{ eventId: "fern_shared_notes", choice: "Offer to study together." }]
    },
    effects: { relationships: { fern: 2 }, flags: { fern_choice_memory_paid_off: true } },
    scenes: [
      { speaker: "Narrator", text: "A seat is already saved at Fern's library table." },
      { speaker: "Fern Holloway", text: "You offered first. I remembered.", portrait: { character: "fern", emotion: "happy" } },
      { speaker: "{firstName}", text: "You remember everything." },
      { speaker: "Fern Holloway", text: "Not everything. Just important things.", portrait: { character: "fern", emotion: "gentle" } }
    ]
  };

  // Club chain step 2. These are missable if the matching meeting is skipped.
  minor.scholars_missing_citation = {
    id: "scholars_missing_citation",
    type: "minor",
    name: "The Missing Citation",
    dayType: "weekday",
    minDay: 14,
    chance: 0.38,
    activityTags: ["any"],
    clubTags: ["scholars"],
    chainId: "club_intro_chain",
    chainStep: 2,
    priority: 69,
    missableOnSkip: true,
    effects: { relationships: { fern: 2 }, flags: { scholars_missing_citation_seen: true } },
    scenes: [
      { speaker: "Narrator", text: "The Scholars Society debate stops over a single missing citation." },
      { speaker: "Fern Holloway", text: "The source existed yesterday.", portrait: { character: "fern", emotion: "serious" } },
      { speaker: "{firstName}", text: "Sources don't usually vanish overnight." },
      { speaker: "Fern Holloway", text: "Exactly.", portrait: { character: "fern", emotion: "concerned" }, choices: [
        { text: "Search the old catalog with Fern.", effect: { relationships: { fern: 2 }, flags: { scholars_catalog_search_started: true }, delayedConsequences: [{ id: "scholars_catalog_result", delayDays: 5, effects: { flags: { scholars_catalog_result_ready: true } }, message: "Fern finds the missing citation under an older catalog number." }] }, scenes: [
          { speaker: "Narrator", text: "You and Fern divide the old index cards between you." }
        ]},
        { text: "Suggest documenting the disappearance.", effect: { flags: { scholars_citation_disappearance_logged: true } }, scenes: [
          { speaker: "Fern Holloway", text: "Good. If it disappears twice, we will know it is not carelessness.", portrait: { character: "fern", emotion: "serious" } }
        ]}
      ]}
    ]
  };

  minor.creatives_hidden_layer = {
    id: "creatives_hidden_layer",
    type: "minor",
    name: "The Hidden Layer",
    dayType: "weekday",
    minDay: 14,
    chance: 0.38,
    activityTags: ["any"],
    clubTags: ["creatives"],
    chainId: "club_intro_chain",
    chainStep: 2,
    priority: 69,
    missableOnSkip: true,
    effects: { flags: { creatives_hidden_layer_seen: true } },
    scenes: [
      { speaker: "Narrator", text: "While cleaning an old practice canvas, a darker image appears beneath the top layer of paint." },
      { speaker: "Narrator", text: "It is a street map of Silvermont, painted years ago and covered deliberately." },
      { speaker: "{firstName}", text: "Why hide a map under flowers?" },
      { speaker: "Narrator", text: "One intersection is marked with a tiny red circle.", choices: [
        { text: "Sketch the hidden map before it is cleaned away.", effect: { flags: { creatives_map_sketch_saved: true } }, scenes: [
          { speaker: "Narrator", text: "You copy the shape of the roads into your notebook." }
        ]},
        { text: "Ask who donated the canvas.", effect: { delayedConsequences: [{ id: "canvas_donor_record", delayDays: 4, effects: { flags: { canvas_donor_record_found: true } }, message: "The Creative Arts adviser finds the old donation record." }] }, scenes: [
          { speaker: "Narrator", text: "The adviser promises to check the storage ledger." }
        ]}
      ]}
    ]
  };

  minor.athletics_last_lap = {
    id: "athletics_last_lap",
    type: "minor",
    name: "The Last Lap",
    dayType: "weekday",
    minDay: 14,
    chance: 0.38,
    activityTags: ["any"],
    clubTags: ["athletics"],
    chainId: "club_intro_chain",
    chainStep: 2,
    priority: 69,
    missableOnSkip: true,
    effects: { flags: { athletics_last_lap_seen: true } },
    scenes: [
      { speaker: "Narrator", text: "Practice should end after the final lap. Instead, a younger student stops halfway around the track." },
      { speaker: "Narrator", text: "Everyone else is already packing up.", choices: [
        { text: "Run the last lap beside them.", effect: { stats: { Kindness: 1 }, flags: { athletics_ran_with_student: true } }, scenes: [
          { speaker: "Narrator", text: "You slow your pace until the two of you cross the line together." }
        ]},
        { text: "Call the coach back.", effect: { flags: { athletics_called_coach_back: true } }, scenes: [
          { speaker: "Narrator", text: "The coach returns before the student has to ask for help alone." }
        ]}
      ]}
    ]
  };

  // Activity-specific flavor with small story hooks.
  minor.study_old_yearbook = {
    id: "study_old_yearbook",
    type: "minor",
    name: "The Wrong Yearbook",
    dayType: "weekday",
    minDay: 7,
    chance: 0.12,
    activityTags: ["study"],
    priority: 24,
    effects: { flags: { old_yearbook_found: true } },
    scenes: [
      { speaker: "Narrator", text: "A mathematics reference book opens to reveal a yearbook hidden inside its cover." },
      { speaker: "Narrator", text: "Someone has crossed out one face in a staff photograph." },
      { speaker: "Narrator", text: "You note the page number before returning to your work." }
    ]
  };

  minor.create_margin_map = {
    id: "create_margin_map",
    type: "minor",
    name: "Map in the Margins",
    dayType: "both",
    minDay: 7,
    chance: 0.12,
    activityTags: ["create"],
    priority: 24,
    effects: { flags: { margin_map_drawn: true } },
    scenes: [
      { speaker: "Narrator", text: "You start drawing streets from memory and realize the same intersection keeps appearing under your pencil." },
      { speaker: "Narrator", text: "You do not remember learning its shape." }
    ]
  };

  minor.exercise_fence_shortcut = {
    id: "exercise_fence_shortcut",
    type: "minor",
    name: "Beyond the Fence",
    dayType: "both",
    minDay: 7,
    chance: 0.12,
    activityTags: ["exercise"],
    priority: 24,
    effects: { flags: { old_service_road_seen: true } },
    scenes: [
      { speaker: "Narrator", text: "During your run, you notice an old service road beyond the estate fence." },
      { speaker: "Narrator", text: "Fresh tire marks cross ground that looks otherwise abandoned." }
    ]
  };

  minor.help_attic_box = {
    id: "help_attic_box",
    type: "minor",
    name: "The Box Marked Later",
    dayType: "both",
    minDay: 7,
    chance: 0.12,
    activityTags: ["help"],
    priority: 24,
    effects: { flags: { attic_box_marked_later_seen: true } },
    scenes: [
      { speaker: "Narrator", text: "While helping Agnes move linens, you find a sealed box labeled LATER in Dorian's handwriting." },
      { speaker: "Agnes Cole", text: "Some things are delayed so long people begin pretending they were decided.", portrait: { character: "agnes", emotion: "concerned" } }
    ]
  };

  minor.socialize_lunch_rumor = {
    id: "socialize_lunch_rumor",
    type: "minor",
    name: "A Rumor With No Name",
    dayType: "weekday",
    minDay: 7,
    chance: 0.12,
    activityTags: ["socialize"],
    priority: 24,
    effects: { flags: { hospital_rumor_heard: true } },
    scenes: [
      { speaker: "Narrator", text: "At lunch, someone mentions an old hospital scandal and immediately changes the subject." },
      { speaker: "Narrator", text: "No one remembers the doctor's name. Everyone remembers being told not to ask." }
    ]
  };

  // Delayed-consequence payoff scenes.
  minor.fern_archive_code_payoff = {
    id: "fern_archive_code_payoff",
    type: "minor",
    name: "An Older Catalog Number",
    dayType: "weekday",
    minDay: 18,
    chance: 1,
    activityTags: ["study", "socialize"],
    priority: 83,
    prerequisiteEvents: ["mystery_archive_receipt"],
    requirements: { flagsAll: ["fern_checked_archive_code"] },
    effects: { relationships: { fern: 1 }, flags: { archive_code_payoff_seen: true } },
    scenes: [
      { speaker: "Fern Holloway", text: "I checked the code.", portrait: { character: "fern", emotion: "serious" } },
      { speaker: "{firstName}", text: "And?" },
      { speaker: "Fern Holloway", text: "It belongs to a municipal archive collection that was supposedly closed before the accident.", portrait: { character: "fern", emotion: "concerned" } },
      { speaker: "Narrator", text: "Another date refuses to fit." }
    ]
  };

  minor.scholars_catalog_payoff = {
    id: "scholars_catalog_payoff",
    type: "minor",
    name: "The Renumbered Source",
    dayType: "weekday",
    minDay: 18,
    chance: 1,
    activityTags: ["study"],
    clubTags: ["scholars"],
    priority: 82,
    prerequisiteEvents: ["scholars_missing_citation"],
    requirements: { flagsAll: ["scholars_catalog_result_ready"] },
    effects: { relationships: { fern: 1 }, flags: { renumbered_source_found: true } },
    scenes: [
      { speaker: "Fern Holloway", text: "The source did not disappear. It was renumbered.", portrait: { character: "fern", emotion: "serious" } },
      { speaker: "{firstName}", text: "By accident?" },
      { speaker: "Fern Holloway", text: "Three times? No.", portrait: { character: "fern", emotion: "concerned" } }
    ]
  };

  window.SilvermontStoryPack = {
    version: "0.14.0",
    ids: [
      "school_founders_assembly", "mystery_archive_receipt", "mystery_anonymous_envelope",
      "ethan_unfinished_question", "ethan_choice_memory_callback",
      "fern_margin_promise", "fern_choice_memory_callback",
      "scholars_missing_citation", "creatives_hidden_layer", "athletics_last_lap",
      "study_old_yearbook", "create_margin_map", "exercise_fence_shortcut", "help_attic_box", "socialize_lunch_rumor",
      "fern_archive_code_payoff", "scholars_catalog_payoff"
    ],
    event: event
  };
})();
