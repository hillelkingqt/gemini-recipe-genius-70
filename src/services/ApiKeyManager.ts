
/**
 * Utility to manage and rotate between multiple Gemini API keys
 */
const API_KEYS = [
  "AIzaSyD5YKvEiSeUPy3HhHjKmvkhB-f6kr1mtKo",
  "AIzaSyA4TppVdydykoU7bCPGr-IeyAbhCJZQDBM",
  "AIzaSyCqQDiGTA-wX4Aggm-xxWATqTjO7tvW8W8",
  "AIzaSyA2KjqBCn4oT8s5s6WUB1VOVfVO_eI4rXA",
  "AIzaSyBvAVYQtaN00UYO1T5dhqcs1a49nOuFyMg",
  "AIzaSyC6sjR-2NCamBDnk6d5ZLA5JbF-Mcr24Uk",
  "AIzaSyAAtKEbdQzllGB9Gf72FzaNY-HLGrk8K5Y",
  "AIzaSyDT_kWAnT5FQv0-TPOpI-knC_tTUco5CoA"
];

export const getRandomApiKey = (): string => {
  const randomIndex = Math.floor(Math.random() * API_KEYS.length);
  return API_KEYS[randomIndex];
};
