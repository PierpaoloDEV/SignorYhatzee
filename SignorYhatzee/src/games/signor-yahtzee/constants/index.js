export const CATEGORIES = [
  { key: "ones", label: "1 (Assi)" },
  { key: "twos", label: "2 (Due)" },
  { key: "threes", label: "3 (Tre)" },
  { key: "fours", label: "4 (Quattro)" },
  { key: "fives", label: "5 (Cinque)" },
  { key: "sixes", label: "6 (Sei)" },
  { key: "threeKind", label: "Tris" },
  { key: "fourKind", label: "Poker" },
  { key: "fullHouse", label: "Full" },
  { key: "smallStraight", label: "Scala Piccola" },
  { key: "largeStraight", label: "Scala Grande" },
  { key: "yahtzee", label: "Yahtzee" },
  { key: "chance", label: "Chance" },
];

export const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export const BET_OPTS = [
  { v: "NO", l: "NO" },
  { v: "SCELTA", l: "A SCELTA" },
  { v: "OBBLIGATORIA", l: "OBBLIGATORIA" }
];

export const TRAP_OPTS = [
  { v: "NO", l: "NO" },
  { v: "VISIBILE", l: "VISIBILE" },
  { v: "NASCOSTA", l: "NASCOSTA" }
];

export const RULES_MODE_OPTS = [
  { v: "SOLO_YAHTZEE", l: "SOLO CON YAHTZEE" },
  { v: "CAOS_1", l: "CAOS (OGNI GIRO)" },
  { v: "CAOS_2", l: "CAOS (OGNI 2 GIRI)" },
  { v: "CAOS_3", l: "CAOS (OGNI 3 GIRI)" },
  { v: "CAOS_4", l: "CAOS (OGNI 4 GIRI)" },
  { v: "CAOS_5", l: "CAOS (OGNI 5 GIRI)" },
  { v: "CAOS_6", l: "CAOS (OGNI 6 GIRI)" }
];

export const SPECIAL_RULES = [
  { key: "minguccio", title: "Regola Minguccio", desc: "Se lanci 5 dadi insieme e ne escono almeno 3 uguali bevi." },
  { key: "mirsi", title: "Regola Mirsi", desc: "Se al terzo lancio la somma dei tuoi dadi è superiore a 22 bevi." },
  { key: "parity_rule", title: "Pari o Dispari", desc: "Se fai un lancio in cui tutti i dadi sono pari o tutti dispari, bevi." },
  { key: "inverted_bet", title: "Inversione", desc: "La scommessa si inverte: se la vinci bevi tu, altrimenti dai un sorso." },
  { key: "simo_rule", title: "Regola Simo", desc: "Se lanci 5 dadi insieme ed escono 3 numeri consecutivi scegli chi beve." },
  { key: "nico_rule", title: "Regola Nico", desc: "Se rilanci 4 o più dadi in un turno (non al primo lancio), bevi." },
  { key: "social_envy", title: "Invidia Sociale", desc: "Scala Piccola: bevono chi ha MENO punti di te. Scala Grande: bevono chi ha PIÙ punti di te. Se nessuno soddisfa la condizione, bevi tu." },
  { key: "seven_devils", title: "Sette Diavoli", desc: "Se la somma dei tuoi dadi dopo un lancio è un multiplo di 7, bevono tutti!" },
  { key: "copycat", title: "Copycat", desc: "Se scegli il punteggio dell'ultima categoria giocata (dall'ultimo giocatore), bevi." },
  { key: "auto_trap", title: "Trappola Automatica", desc: "Ogni volta che segni punti (>0) su una categoria, viene automaticamente piazzata una trappola su di essa." },
  { key: "counter_trap", title: "Counterspell", desc: "Quando cadi in una trappola, sei tu a scegliere chi beve invece di bere tu." },
];

export const CUSTOM_PART_1 = [
  "Bevono tutti",
  "Bevi tu",
  "Scegli chi beve",
  "Il giocatore con più punti beve",
  "Il giocatore con meno punti beve",
  "Bevono tutti tranne te",
  "Bevi tu il doppio",
];

export const CUSTOM_PART_2 = [
  "quando fai punti su",
  "quando NON fai punti su (0 pt)",
];

export const CUSTOM_PART_3 = [
  { key: "ones", label: "1 (Assi)" },
  { key: "twos", label: "2 (Due)" },
  { key: "threes", label: "3 (Tre)" },
  { key: "fours", label: "4 (Quattro)" },
  { key: "fives", label: "5 (Cinque)" },
  { key: "sixes", label: "6 (Sei)" },
  { key: "threeKind", label: "Tris" },
  { key: "fourKind", label: "Poker" },
  { key: "fullHouse", label: "Full" },
  { key: "smallStraight", label: "Scala Piccola" },
  { key: "largeStraight", label: "Scala Grande" },
  { key: "chance", label: "Chance" },
];
