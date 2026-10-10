/* ==========================================================================
   Site content config — edit this file to swap in videos.

   Video sources can be:
     • a local file   "assets/videos/main_demo.mp4"   (H.264 mp4, see tools/encode.sh)
     • a YouTube URL  "https://youtu.be/XXXXXXXXXXX"
     • a Vimeo URL    "https://vimeo.com/123456789"
   Posters are optional; for local files a sibling .jpg (same name) is used
   automatically when `poster` is omitted. Missing files show a placeholder.

   Clip fields:
     label    text above the video (\n starts a new line)
     role     "ours" highlights the clip; anything else is a baseline
     src      video source
     outcome  optional tag, e.g. "Success", "Failed at grasp"
     outcomeType  optional "ok" | "fail" | "neutral" (guessed from text if omitted)
     stages   optional [{ label, t }] chapter chips; t in seconds
     note     optional caption under the clip
   ========================================================================== */

window.SITE_CONFIG = {
  hero: {
    // Final film (film-1080p.mp4); the cover is its frame at 0:19.6.
    title: 'CRIS-0 · Main demo',
    // Set false for a static cover; a video path enables a muted background loop.
    preview: false,
    // Full demo (with sound) opened when the cover is clicked.
    video: 'assets/videos/main_demo.mp4?v=2',
    poster: 'assets/img/cover.jpg?v=2',
    // duration: '3:12',   // shown under "Watch the demo"; auto-detected for local files
  },

  experiments: [
    {
      id: 'robustness',
      tab: 'Robustness',
      title: 'Robustness to disturbances',
      summary: 'Objects get moved, people reach in, and lighting shifts mid-task. Because CRIS-0 tracks which stage the task is in, it can return to the affected stage after a disturbance (e.g., re-positioning the gripper and giving the grasping policy a good starting pose again).',
      scenarios: [
        {
          label: 'Object displacement',
          caption: 'The object the robot is working with is moved mid-task. Played at 1× the original speed.',
          clips: [
            { label: 'Coffee bag moved before the grasp', role: 'ours', src: 'assets/videos/compare/robustness_displacement_1_cris0.mp4' },
            { label: 'Grinder moved before pouring', role: 'ours', src: 'assets/videos/compare/robustness_displacement_2_cris0.mp4' },
          ],
        },
        {
          label: 'Human intervention',
          caption: 'A person reaches in and interferes while the task is running. Played at 1× the original speed.',
          clips: [
            { label: 'An apple is added to the plate; the robot removes it before microwaving', role: 'ours', src: 'assets/videos/compare/robustness_human_1_cris0.mp4' },
            { label: 'A hand nears the microwave door; the robot backs off to avoid pinching it', role: 'ours', src: 'assets/videos/compare/robustness_human_2_cris0.mp4' },
          ],
        },
        {
          label: 'Visual disturbance',
          caption: 'The robot keeps working through heavy lighting disturbances. Played at 1× the original speed.',
          clips: [
            { label: 'Pouring coffee beans under heavily flickering light', role: 'ours', src: 'assets/videos/compare/robustness_visual_cris0.mp4' },
          ],
        },
      ],
    },

    {
      id: 'autonomy',
      tab: 'Autonomy',
      title: 'Autonomy over long horizons',
      summary: 'Long tasks run without human intervention. Stage-wise verification catches local failures and corrects them through retries or replanning before they propagate to later stages.',
      scenarios: [
        {
          label: 'Tidying the coffee table',
          caption: 'The robot handles a variety of objects on its own from start to finish. Played at 10× the original speed.',
          clips: [
            { label: 'Tidying an entire cluttered coffee table in one continuous run', role: 'ours', src: 'assets/videos/compare/autonomy_long_horizon_2_cris0.mp4' },
          ],
        },
      ],
    },

    {
      id: 'personalization',
      tab: 'Personalization',
      title: 'Personalized assistance',
      summary: 'Vague requests need grounding in what the user actually wants. CRIS-0 picks the most suitable object by combining the user’s past preferences with the current situation.',
      scenarios: [
        {
          label: 'Choosing a drink for the user',
          caption: 'Asked for a drink, the robot picks a different one depending on the user’s preferences. Played at 1× the original speed.',
          clips: [
            { label: 'Scenario 1', role: 'ours', src: 'assets/videos/compare/personalization_drink_1_cris0.mp4' },
            { label: 'Scenario 2', role: 'ours', src: 'assets/videos/compare/personalization_drink_2_cris0.mp4' },
          ],
        },
      ],
    },

    {
      id: 'context',
      tab: 'Context reasoning',
      title: 'Reasoning about what each object needs',
      summary: 'Different objects can require different handling, and the appropriate action for the same object may change with its state. CRIS-0 reasons about each object\u2019s properties and current condition in the context of the task, selecting and adapting its actions accordingly.',
      scenarios: [
        {
          label: 'Handling each object as it needs',
          caption: 'The robot decides how to handle each object from what it is and the state it is in. Left played at 2× the original speed, right at 1×.',
          clips: [
            { label: 'The empty can is thrown away; the unopened one goes on the tray', role: 'ours', src: 'assets/videos/compare/context_1_cris0.mp4' },
            { label: 'The book goes on the coffee table; the private bill goes in the drawer', role: 'ours', src: 'assets/videos/compare/context_2_cris0.mp4' },
          ],
        },
      ],
    },

    {
      id: 'manipulation',
      tab: 'Complex manipulation',
      title: 'Tablecloth replacement',
      summary: 'A complex manipulation task is reduced to a sequence of simple, verifiable atomic stages (e.g., push, grasp, fold, and place), each one easy to execute and check on its own.',
      scenarios: [
        {
          label: 'Replacing the tablecloth',
          caption: 'The robot clears the used tablecloth and lays a fresh one. Both played at 1× the original speed.',
          clips: [
            { label: 'Clearing: fold the tablecloth and put it in the basket', role: 'ours', src: 'assets/videos/compare/manipulation_tablecloth_1_cris0.mp4' },
            { label: 'Laying: take a fresh tablecloth and spread it flat', role: 'ours', src: 'assets/videos/compare/manipulation_tablecloth_2_cris0.mp4' },
          ],
        },
      ],
    },

    {
      id: 'generalization',
      tab: 'Generalization',
      title: 'Generalization to new objects',
      summary: 'Different tasks often share similar skills. CRIS-0 identifies these shared skills on its own and applies them in new scenarios.',
      scenarios: [
        {
          label: 'Cakes and apples',
          caption: 'The skill for picking and placing cakes transfers to picking and placing apples. Played at about 1× the original speed.',
          clips: [
            { label: 'Putting cakes into a box', role: 'ours', src: 'assets/videos/compare/generalization_1_cris0.mp4' },
            { label: 'Putting apples onto a plate', role: 'ours', src: 'assets/videos/compare/generalization_2_cris0.mp4' },
          ],
        },
      ],
    },
  ],
};
