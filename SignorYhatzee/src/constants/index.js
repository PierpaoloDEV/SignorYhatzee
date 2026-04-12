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

export const SPECIAL_RULES = [
  { key: "minguccio", title: "Regola Minguccio", desc: "Se lanci 5 dadi insieme e ne escono almeno 3 uguali bevi." },
  { key: "mirsi", title: "Regola Mirsi", desc: "Se al terzo lancio la somma dei tuoi dadi è superiore a 22 bevi." },
  { key: "giandu", title: "Regola Giandu", desc: "Sostituisci i 'Beve quello con il punteggio più basso/alto' con 'Bevono tutti quelli con il punteggio più basso/alto di te'." },
];

export const CUSTOM_PART_1 = ["Bevono tutti", "Bevi tu", "Scegli chi beve"];
export const CUSTOM_PART_2 = ["quando fai punti su", "quando NON fai punti su (0 pt)"];
