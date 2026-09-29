import { AgeGroup } from "./user-store";

export interface Tone {
  correct: string;
  cheers: string[];
  breakMessages: string[];
  perfectTitle: string;
  goodTitle: string;
  keepGoingTitle: string;
  readyNudge: string;
  exitTitle: string;
  practiceCta: string;
}

/**
 * Copy tuned per age group: warm and emoji-rich for little ones, encouraging
 * for middle years, and brief and matter-of-fact for teens (who find
 * "You're amazing! ⭐" patronising).
 */
const TONES: Record<AgeGroup, Tone> = {
  young: {
    correct: "Yay! Correct!",
    cheers: ["Super star! 🌟", "Wow! ⭐", "You did it! 🎉", "High five! ✋", "Amazing! 🌈"],
    breakMessages: ["Wiggle your fingers! Then tap Continue.", "Big stretch! Reach up high!", "Take a deep breath… and go!"],
    perfectTitle: "Perfect! 🎉",
    goodTitle: "Great job! 👏",
    keepGoingTitle: "Good try! 🌱",
    readyNudge: "You're getting really good at this!",
    exitTitle: "Stop playing?",
    practiceCta: "Play",
  },
  middle: {
    correct: "Correct!",
    cheers: ["On fire! 🔥", "Brilliant! ✨", "Unstoppable! 💪", "Nailed it! 🎯"],
    breakMessages: ["Nice work so far. Stretch, then tap Continue.", "Halfway hero! Take a moment.", "Shake out your hands and keep going!"],
    perfectTitle: "Perfect round! 🎉",
    goodTitle: "Well done! 👏",
    keepGoingTitle: "Keep practising 💪",
    readyNudge: "Fast and accurate — you're nearly test-ready.",
    exitTitle: "Leave this session?",
    practiceCta: "Practice",
  },
  older: {
    correct: "Correct",
    cheers: ["Streak 🔥", "Clean.", "Sharp.", "Locked in."],
    breakMessages: ["Checkpoint. Clock's paused.", "Quick reset — continue when ready.", "Good pace. Clock's paused."],
    perfectTitle: "Flawless",
    goodTitle: "Solid round",
    keepGoingTitle: "Room to improve",
    readyNudge: "Accuracy and pace are there — take the test.",
    exitTitle: "Quit this set?",
    practiceCta: "Start",
  },
};

export function getTone(ageGroup: AgeGroup): Tone {
  return TONES[ageGroup] ?? TONES.middle;
}
