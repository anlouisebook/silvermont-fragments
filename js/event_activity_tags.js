"use strict";
/* v0.9.0 activity eligibility tags. */
(function () {
  Object.values(STORY.events.major).forEach((event) => { event.activityTags = ["any"]; });
  const tags = {
    birthday: ["any"],
    home_family_breakfast: ["help"],
    dorian_desk_light: ["help", "study"],
    agnes_evening_tea: ["help"],
    ethan_playground_intro: ["socialize", "exercise"],
    fern_school_intro: ["study", "socialize"],
    scholars_first_meeting: ["study"],
    creatives_first_meeting: ["create"],
    athletics_first_meeting: ["exercise"],
    shopping_district_first_visit: ["socialize"]
  };
  Object.entries(tags).forEach(([id, activityTags]) => {
    if (STORY.events.minor[id]) STORY.events.minor[id].activityTags = activityTags;
  });
})();
