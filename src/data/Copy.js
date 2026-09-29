export const START_SCREEN = {
  eyebrow: 'SEISMIC NETWORK · HOW TO PLAY',
  title: 'Outrun the MEV Bots.<br/>Keep the ledger sealed.',
  lede:
    "Rocky's built from granite and doesn't scare easy. He's hauling a transaction through the mempool, and the whole jungle is full of bots that would love a peek at it. Don't let them.",
  rules: [
    {
      tag: 'danger',
      title: 'Obstacles',
      text: 'Jump the Gas Spikes or they chip 3 seconds off your Shield. Reentrancy Barriers don\u2019t forgive - dodge lanes or it\u2019s game over.',
    },
    {
      tag: 'privacy',
      title: 'Shield',
      text: 'Grab a Gemstone, get 10 seconds of encryption glow. Chain two back-to-back and you\u2019re Ultra-Private: invincible, magnetic, unstoppable.',
    },
    {
      tag: 'gold',
      title: 'Victory',
      text: 'Survive 360 seconds and your transaction reaches finality. That\u2019s the whole game. Don\u2019t die.',
    },
  ],
  startButton: 'START GAME',
  codexButton: 'What does this all mean?',
};

export const CODEX_ENTRIES = [
  {
    tag: 'Rocky',
    text: "Rocky is any transaction in flight. What's in his hand is what everyone's trying to read before it lands.",
  },
  {
    tag: 'Gemstones',
    text: 'Encryption you can hold. Grab one and the mempool goes dark - nobody\u2019s reading your business.',
  },
  {
    tag: 'Green Aura',
    text: 'What "encrypted" looks like when it\u2019s working. While it\u2019s up, you\u2019re a ghost.',
  },
  {
    tag: 'Decryption Bar',
    text: 'The clock starts the second your shield drops. Run it out and the whole transaction is exposed.',
  },
  {
    tag: 'Red Eyes',
    text: "MEV bots, watching the mempool for anything undefended. They don't blink.",
  },
  {
    tag: 'Tracker Bot',
    text: "This one isn't scanning at random - it's locked onto you specifically. Switch lanes like you mean it.",
  },
  {
    tag: 'Gas Spikes',
    text: "Network friction. Annoying, not fatal - unless you're already out of shield.",
  },
  {
    tag: 'Reentrancy Barriers',
    text: 'The bug that\u2019s ended a hundred contracts. Hit one and there\u2019s no recovering.',
  },
  {
    tag: 'SIZE Coins',
    text: 'Every coin is value that moved safely. Your score is a receipt.',
  },
  {
    tag: 'MEV Risk Meter',
    text: 'How exposed you are, right now, in real time. Watch it climb and go get a gem before it matters.',
  },
  {
    tag: 'Finality (360s)',
    text: 'The moment your transaction is locked into the chain for good. No bot, no reorg, no take-backs.',
  },
];

export const LOSE_SCREEN = {
  eyebrow: 'DECRYPTION COMPLETE',
  title: 'Caught with your shield down.<br/>The bots got everything.',
  scoreLabel: 'Final score',
  timeLabel: 'You lasted',
  retryButton: 'Run it back',
  shareButton: 'Share your run',
};

export const WIN_SCREEN = {
  eyebrow: 'FINALITY REACHED',
  title: 'Sealed, signed, unreadable.<br/>Rocky made it.',
  scoreLabel: 'Final score',
  timeLabel: 'Uptime',
  retryButton: 'Go again',
  shareButton: 'Share your run',
};

export const HUD_LABELS = {
  boostBanner: 'ULTRA-PRIVATE. NOTHING CAN TOUCH YOU.',
  checkpointBanner: 'CHECKPOINT CLEARED - TRANSACTION CONFIRMED',
};
