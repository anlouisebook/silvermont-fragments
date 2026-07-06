"use strict";
(function () {
  const events = STORY.events.minor;

  events.ethan_second_meeting = {
    id: "ethan_second_meeting",
    type: "minor",
    dayType: "both",
    minDay: 7,
    chance: 0.16,
    name: "The Quiet Boy",
    sourceLabel: "event_ethan_second_meeting",
    activityTags: ["socialize", "exercise"],
    chainId: "ethan_intro_chain",
    chainStep: 1,
    effects: { relationships: { ethan: 3 } },
    scenes: [
      { speaker: "Narrator", text: "You find yourself looking for Ethan before you even realize it." },
      { speaker: "Narrator", text: "The playground is almost empty again. The swings are still. And there he is." },
      { speaker: "Narrator", text: "Same bench. Same straight posture. Same unread book." },
      { speaker: "Ethan Blackwell", text: "You're here again.", portrait: { character: "ethan", emotion: "neutral" } },
      { speaker: "{firstName}", text: "So are you." },
      { speaker: "Ethan Blackwell", text: "That's true.", portrait: { character: "ethan", emotion: "neutral" } },
      { speaker: "Narrator", text: "It is not much of a conversation. But it is more than last time.", choices: [
        { text: "Ask if you can sit with him.", scenes: [
          { speaker: "{firstName}", text: "Can I sit here?" },
          { speaker: "Narrator", text: "Ethan looks at the empty space beside him. Then at you." },
          { speaker: "Ethan Blackwell", text: "If you want.", portrait: { character: "ethan", emotion: "neutral" } },
          { speaker: "Narrator", text: "You sit on the bench, leaving a careful amount of space between you. Ethan does not move away." }
        ]},
        { text: "Sit on the swings instead.", scenes: [
          { speaker: "Narrator", text: "You go to the swings instead of the bench. The chains creak as you sit." },
          { speaker: "Ethan Blackwell", text: "You like swings?", portrait: { character: "ethan", emotion: "neutral" } },
          { speaker: "{firstName}", text: "I think so." },
          { speaker: "Ethan Blackwell", text: "You think so?", portrait: { character: "ethan", emotion: "neutral" } },
          { speaker: "{firstName}", text: "I haven't decided yet." },
          { speaker: "Narrator", text: "For the first time, Ethan almost smiles. Almost." }
        ]},
        { text: "Ask about his book.", scenes: [
          { speaker: "{firstName}", text: "What are you reading?" },
          { speaker: "Ethan Blackwell", text: "History.", portrait: { character: "ethan", emotion: "neutral" } },
          { speaker: "{firstName}", text: "For school?" },
          { speaker: "Ethan Blackwell", text: "No.", portrait: { character: "ethan", emotion: "neutral" } },
          { speaker: "{firstName}", text: "For fun?" },
          { speaker: "Ethan Blackwell", text: "Maybe.", portrait: { character: "ethan", emotion: "neutral" } },
          { speaker: "{firstName}", text: "It doesn't look fun." },
          { speaker: "Ethan Blackwell", text: "Most useful things don't.", portrait: { character: "ethan", emotion: "neutral" } }
        ]}
      ]},
      { speaker: "Narrator", text: "A few younger children run across the playground, laughing loudly. Ethan's shoulders stiffen." },
      { speaker: "{firstName}", text: "Do you not like noise?" },
      { speaker: "Ethan Blackwell", text: "Noise is fine.", portrait: { character: "ethan", emotion: "guarded" } },
      { speaker: "{firstName}", text: "Then what don't you like?" },
      { speaker: "Ethan Blackwell", text: "People who make noise on purpose.", portrait: { character: "ethan", emotion: "guarded" } },
      { speaker: "{firstName}", text: "At my house, it's quiet too." },
      { speaker: "Ethan Blackwell", text: "Because of your uncle?", portrait: { character: "ethan", emotion: "neutral" } },
      { speaker: "{firstName}", text: "Dorian? He's not scary. Well... not always." },
      { speaker: "Ethan Blackwell", text: "Adults are usually scary when they are trying not to be.", portrait: { character: "ethan", emotion: "serious" } },
      { speaker: "{firstName}", text: "Is your house scary?" },
      { speaker: "Ethan Blackwell", text: "It's quiet.", portrait: { character: "ethan", emotion: "guarded" } },
      { speaker: "Narrator", text: "You recognize what he is doing. He is answering without answering." },
      { speaker: "{firstName}", text: "Quiet can be scary." },
      { speaker: "Ethan Blackwell", text: "Yes.", portrait: { character: "ethan", emotion: "concerned" } },
      { speaker: "Narrator", text: "The silence feels different from last time. Less like a wall. More like a blanket pulled carefully over something fragile." },
      { speaker: "Ethan Blackwell", text: "Do you come here every week?", portrait: { character: "ethan", emotion: "neutral" } },
      { speaker: "{firstName}", text: "Maybe. I haven't decided yet." },
      { speaker: "Narrator", text: "This time, Ethan does smile. It is small. Gone almost immediately. But you saw it." },
      { speaker: "Ethan Blackwell", text: "Then maybe I will see you again.", portrait: { character: "ethan", emotion: "happy" } },
      { speaker: "{firstName}", text: "Maybe." },
      { speaker: "Ethan Blackwell", text: "The swings are better when you sit in the left one.", portrait: { character: "ethan", emotion: "neutral" } },
      { speaker: "{firstName}", text: "Why?" },
      { speaker: "Ethan Blackwell", text: "It doesn't squeak as much.", portrait: { character: "ethan", emotion: "neutral" } },
      { speaker: "Narrator", text: "And this time, when you leave, he opens his book. But you are almost sure he is not reading." }
    ]
  };

  events.ethan_playground_friendship = {
    id: "ethan_playground_friendship",
    type: "minor",
    dayType: "both",
    minDay: 14,
    chance: 0.14,
    name: "A Shared Swing",
    sourceLabel: "event_ethan_friendship",
    activityTags: ["socialize", "exercise"],
    chainId: "ethan_intro_chain",
    chainStep: 2,
    effects: { relationships: { ethan: 5 } },
    scenes: [
      { speaker: "Narrator", text: "The left swing does not squeak. Ethan was right." },
      { speaker: "Ethan Blackwell", text: "See?", portrait: { character: "ethan", emotion: "neutral" } },
      { speaker: "{firstName}", text: "You sound proud." },
      { speaker: "Ethan Blackwell", text: "I was correct.", portrait: { character: "ethan", emotion: "neutral" } },
      { speaker: "{firstName}", text: "That's different from being proud?" },
      { speaker: "Ethan Blackwell", text: "Maybe.", portrait: { character: "ethan", emotion: "happy" } },
      { speaker: "Narrator", text: "Today, his book is closed before you arrive. That feels important." },
      { speaker: "{firstName}", text: "Are you going to sit there forever?" },
      { speaker: "Ethan Blackwell", text: "I don't usually use them. They're for children.", portrait: { character: "ethan", emotion: "serious" } },
      { speaker: "{firstName}", text: "We are children." },
      { speaker: "Narrator", text: "For once, he seems to have no answer.", choices: [
        { text: "Tease him gently.", scenes: [
          { speaker: "{firstName}", text: "Are you scared of swings?" },
          { speaker: "Ethan Blackwell", text: "No.", portrait: { character: "ethan", emotion: "tense" } },
          { speaker: "{firstName}", text: "Then prove it." },
          { speaker: "Narrator", text: "Ethan narrows his eyes. You are learning that this expression means he has accepted a challenge." }
        ]},
        { text: "Ask kindly.", scenes: [
          { speaker: "{firstName}", text: "You don't have to. But you can if you want." },
          { speaker: "Narrator", text: "Ethan looks at you. Maybe that is why he does not immediately refuse again." },
          { speaker: "{firstName}", text: "It doesn't have to mean anything. It's just a swing." }
        ]},
        { text: "Stay quiet and wait.", scenes: [
          { speaker: "Narrator", text: "You do not push him. You just keep swinging gently." },
          { speaker: "Ethan Blackwell", text: "You're very patient.", portrait: { character: "ethan", emotion: "neutral" } },
          { speaker: "{firstName}", text: "Is that bad?" },
          { speaker: "Ethan Blackwell", text: "No.", portrait: { character: "ethan", emotion: "gentle" } }
        ]}
      ]},
      { speaker: "Narrator", text: "Ethan approaches the swing like it might betray him. He sits carefully. Too carefully." },
      { speaker: "{firstName}", text: "You have to push with your feet." },
      { speaker: "Ethan Blackwell", text: "I know how a swing works.", portrait: { character: "ethan", emotion: "serious" } },
      { speaker: "Narrator", text: "He pushes lightly. The swing moves forward. Only a little. Then back." },
      { speaker: "Ethan Blackwell", text: "This is pointless.", portrait: { character: "ethan", emotion: "neutral" } },
      { speaker: "{firstName}", text: "Most fun things are." },
      { speaker: "Ethan Blackwell", text: "That sounds inefficient.", portrait: { character: "ethan", emotion: "serious" } },
      { speaker: "{firstName}", text: "You're inefficient." },
      { speaker: "Narrator", text: "Then, unexpectedly, he laughs. It is not loud. It is not even very long. But it is real." },
      { speaker: "{firstName}", text: "Race you." },
      { speaker: "Ethan Blackwell", text: "That is not how swings work.", portrait: { character: "ethan", emotion: "neutral" } },
      { speaker: "{firstName}", text: "It is now." },
      { speaker: "Narrator", text: "For a few minutes, the two of you swing side by side. The playground does not feel so empty anymore." },
      { speaker: "Ethan Blackwell", text: "Do you always talk this much?", portrait: { character: "ethan", emotion: "happy" } },
      { speaker: "{firstName}", text: "Only when someone is being difficult." },
      { speaker: "Ethan Blackwell", text: "I'm not difficult. Fine. Maybe a little.", portrait: { character: "ethan", emotion: "happy" } },
      { speaker: "Ethan Blackwell", text: "You can sit here again.", portrait: { character: "ethan", emotion: "gentle" } },
      { speaker: "{firstName}", text: "On the swing?" },
      { speaker: "Ethan Blackwell", text: "At the playground.", portrait: { character: "ethan", emotion: "guarded" } },
      { speaker: "Narrator", text: "The invitation is awkward. Careful. As if he is offering something fragile and hoping you will not point it out." },
      { speaker: "{firstName}", text: "Okay. You can sit here again too." },
      { speaker: "Ethan Blackwell", text: "Okay.", portrait: { character: "ethan", emotion: "happy" } },
      { speaker: "Narrator", text: "When Agnes comes to get you, you do not feel quite as alone as before." }
    ]
  };

  events.fern_shared_notes = {
    id: "fern_shared_notes",
    type: "minor",
    dayType: "weekday",
    minDay: 7,
    chance: 0.16,
    name: "Shared Notes",
    sourceLabel: "event_fern_shared_notes",
    activityTags: ["study", "socialize"],
    chainId: "fern_intro_chain",
    chainStep: 1,
    effects: { relationships: { fern: 3 } },
    scenes: [
      { speaker: "Narrator", text: "You find Fern at the edge of the classroom after the last lesson." },
      { speaker: "Narrator", text: "She is rewriting her notes with a focus that makes the rest of the room seem blurry." },
      { speaker: "Fern Holloway", text: "If I write it twice, I remember it better.", portrait: { character: "fern", emotion: "neutral" } },
      { speaker: "{firstName}", text: "How did you know it was me?" },
      { speaker: "Fern Holloway", text: "Your shoes are quieter than most people here.", portrait: { character: "fern", emotion: "neutral" } },
      { speaker: "Narrator", text: "Fern finally looks up and smiles.", choices: [
        { text: "Ask what she is studying.", scenes: [
          { speaker: "{firstName}", text: "What are you working on?" },
          { speaker: "Fern Holloway", text: "Everything.", portrait: { character: "fern", emotion: "neutral" } },
          { speaker: "{firstName}", text: "Everything?" },
          { speaker: "Fern Holloway", text: "I like being prepared.", portrait: { character: "fern", emotion: "guarded" } }
        ]},
        { text: "Offer to study together.", scenes: [
          { speaker: "{firstName}", text: "We could study together sometime." },
          { speaker: "Fern Holloway", text: "Really?", portrait: { character: "fern", emotion: "happy" } },
          { speaker: "{firstName}", text: "If you want." },
          { speaker: "Fern Holloway", text: "I want.", portrait: { character: "fern", emotion: "happy" } }
        ]},
        { text: "Compliment her notes.", scenes: [
          { speaker: "{firstName}", text: "Your notes are pretty." },
          { speaker: "Fern Holloway", text: "They're organized.", portrait: { character: "fern", emotion: "neutral" } },
          { speaker: "{firstName}", text: "They can be both." },
          { speaker: "Fern Holloway", text: "Maybe.", portrait: { character: "fern", emotion: "gentle" } }
        ]}
      ]},
      { speaker: "Narrator", text: "Fern slides one page toward you." },
      { speaker: "Fern Holloway", text: "Here. This part confused some people.", portrait: { character: "fern", emotion: "neutral" } },
      { speaker: "{firstName}", text: "You're giving me your notes?" },
      { speaker: "Fern Holloway", text: "Sharing. Giving sounds too final.", portrait: { character: "fern", emotion: "happy" } },
      { speaker: "Fern Holloway", text: "Besides, if you understand it too, then I can ask you if I get stuck.", portrait: { character: "fern", emotion: "neutral" } },
      { speaker: "{firstName}", text: "So this is also for you." },
      { speaker: "Fern Holloway", text: "Obviously.", portrait: { character: "fern", emotion: "happy" } },
      { speaker: "Narrator", text: "You decide you like it. Not because it is perfect. Because it keeps trying." }
    ]
  };

  events.fern_library_promise = {
    id: "fern_library_promise",
    type: "minor",
    dayType: "weekday",
    minDay: 14,
    chance: 0.14,
    name: "A Quiet Promise",
    sourceLabel: "event_fern_library_promise",
    activityTags: ["study", "socialize"],
    chainId: "fern_intro_chain",
    chainStep: 2,
    effects: { relationships: { fern: 5 }, flags: { fern_promised_library_visit: true } },
    scenes: [
      { speaker: "Narrator", text: "Fern catches up to you near the hallway windows." },
      { speaker: "Narrator", text: "She is carrying three books, two notebooks, and a pencil tucked behind one ear." },
      { speaker: "Fern Holloway", text: "{firstName}!", portrait: { character: "fern", emotion: "happy" } },
      { speaker: "Fern Holloway", text: "I found the library shelf I told you about.", portrait: { character: "fern", emotion: "happy" } },
      { speaker: "{firstName}", text: "You told me about a shelf?" },
      { speaker: "Fern Holloway", text: "Not yet. I was going to.", portrait: { character: "fern", emotion: "neutral" } },
      { speaker: "Fern Holloway", text: "There is a corner in the library where almost no one sits. Good light. Quiet table. Only one chair that wobbles.", portrait: { character: "fern", emotion: "neutral" } },
      { speaker: "{firstName}", text: "That sounds very specific." },
      { speaker: "Fern Holloway", text: "Good places are specific.", portrait: { character: "fern", emotion: "happy" }, choices: [
        { text: "Promise to visit with her.", scenes: [
          { speaker: "{firstName}", text: "Show me sometime." },
          { speaker: "Narrator", text: "Fern's whole face brightens." },
          { speaker: "Fern Holloway", text: "I will.", portrait: { character: "fern", emotion: "happy" } }
        ]},
        { text: "Ask why she likes quiet places.", scenes: [
          { speaker: "{firstName}", text: "Why do you like quiet places?" },
          { speaker: "Fern Holloway", text: "Because I don't have to guess what everyone means.", portrait: { character: "fern", emotion: "concerned" } }
        ]},
        { text: "Joke about the wobbly chair.", scenes: [
          { speaker: "{firstName}", text: "Do I get the wobbly chair?" },
          { speaker: "Fern Holloway", text: "Only if you prove you can handle the responsibility.", portrait: { character: "fern", emotion: "happy" } },
          { speaker: "Narrator", text: "You laugh, and Fern looks proud of herself." }
        ]}
      ]},
      { speaker: "Narrator", text: "The bell rings again. Fern makes a tiny frustrated sound." },
      { speaker: "Fern Holloway", text: "One day, I will finish a conversation before a bell interrupts me.", portrait: { character: "fern", emotion: "neutral" } },
      { speaker: "{firstName}", text: "Maybe in the library." },
      { speaker: "Fern Holloway", text: "Exactly.", portrait: { character: "fern", emotion: "happy" } },
      { speaker: "Narrator", text: "She smiles at you like you have made a promise. Maybe you have." }
    ]
  };

  events.club_fair = {
    id: "club_fair",
    type: "minor",
    dayType: "weekday",
    minDay: 7,
    chance: 1,
    name: "Club Fair",
    activityTags: ["any"],
    chainId: "club_intro_chain",
    chainStep: 0,
    prerequisiteEvents: ["fern_school_intro"],
    effects: { flags: { club_fair_seen: true } },
    scenes: [
      { speaker: "Narrator", text: "After classes, tables fill the academy hall with sign-up sheets, handmade posters, and students trying very hard to look casual." },
      { speaker: "Fern Holloway", text: "Club fair.", portrait: { character: "fern", emotion: "happy" } },
      { speaker: "{firstName}", text: "Do I have to join one?" },
      { speaker: "Fern Holloway", text: "No. But I joined Scholars Society.", portrait: { character: "fern", emotion: "neutral" } },
      { speaker: "Narrator", text: "You can join one club for now, or choose none.", choices: [
        { text: "Join Scholars Society.", effect: { clubJoin: "scholars" }, scenes: [{ speaker: "Fern Holloway", text: "You joined? Good. I mean—good choice.", portrait: { character: "fern", emotion: "happy" } }] },
        { text: "Join Creative Arts Club.", effect: { clubJoin: "creatives" }, scenes: [{ speaker: "Narrator", text: "You write your name beneath a poster covered in paint, paper flowers, and bright ink." }] },
        { text: "Join Athletics Club.", effect: { clubJoin: "athletics" }, scenes: [{ speaker: "Narrator", text: "You add your name to the athletics list beside a sketch of the school field." }] },
        { text: "Do not join a club.", effect: { clubJoin: null }, scenes: [{ speaker: "Narrator", text: "You decide not to commit to a club. Your afternoons remain your own." }] }
      ]}
    ]
  };
})();
