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
  { v: "CAOS_4", l: "CAOS (OGNI 4 GIRI)" },
  { v: "CAOS_6", l: "CAOS (OGNI 6 GIRI)" }
];

export const SPECIAL_RULES = [
  { key: "minguccio", title: "Regola Minguccio", desc: "Se lanci 5 dadi insieme e ne escono almeno 3 uguali bevi." },
  { key: "mirsi", title: "Regola Mirsi", desc: "Se al terzo lancio la somma dei tuoi dadi è superiore a 22 bevi." },
  { key: "parity_rule", title: "Pari o Dispari", desc: "Se fai un lancio in cui tutti i dadi sono pari o tutti dispari, bevi." },
  { key: "inverted_bet", title: "Inversione", desc: "La scommessa si inverte: se la vinci bevi tu, altrimenti dai un sorso" },
  { key: "simo_rule", title: "Regola Simo", desc: "Se lanci 5 dadi insieme ed escono 3 numeri consecutivi scegli chi beve." },
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
  { key: "ones",         label: "1 (Assi)" },
  { key: "twos",         label: "2 (Due)" },
  { key: "threes",       label: "3 (Tre)" },
  { key: "fours",        label: "4 (Quattro)" },
  { key: "fives",        label: "5 (Cinque)" },
  { key: "sixes",        label: "6 (Sei)" },
  { key: "threeKind",    label: "Tris" },
  { key: "fourKind",     label: "Poker" },
  { key: "fullHouse",    label: "Full" },
  { key: "smallStraight",label: "Scala Piccola" },
  { key: "largeStraight",label: "Scala Grande" },
  { key: "chance",       label: "Chance" },
];
