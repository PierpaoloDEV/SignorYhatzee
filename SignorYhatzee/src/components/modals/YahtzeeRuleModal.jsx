import { useState, useEffect } from "react";
import { CUSTOM_PART_1, CUSTOM_PART_2, CUSTOM_PART_3, SPECIAL_RULES } from "../../constants";

export default function YahtzeeRuleModal({ state }) {
  const { showRuleModal, setShowRuleModal, activeRules, setActiveRules, nextTurn } = state;
  const [ruleTab, setRuleTab] = useState("custom");
  const [customRuleDraft, setCustomRuleDraft] = useState({ part1: "", part2: "", part3: "" });
  const [options, setOptions] = useState({ part1: [], part2: "", part3: [] });

  // Effetto per randomizzare le opzioni ogni volta che si apre il modal
  useEffect(() => {
    if (showRuleModal && ruleTab === "custom") {
      const getRand = (arr, n) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
      };

      const rand1 = getRand(CUSTOM_PART_1, 3);
      const rand2 = getRand(CUSTOM_PART_2, 1)[0];
      const rand3 = getRand(CUSTOM_PART_3, 3);

      setOptions({
        part1: rand1,
        part2: rand2,
        part3: rand3
      });

      // Seleziona il primo di default tra quelli usciti random
      setCustomRuleDraft({
        part1: rand1[0],
        part2: rand2,
        part3: rand3[0].key
      });
    }
  }, [showRuleModal, ruleTab]);

  if (!showRuleModal) return null;

  return (
    <div className="popup-overlay" style={{ zIndex: 3000 }}>
      <div className="popup bet-popup" style={{ width: '90%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '15px' }}>📜 Crea Nuova Regola</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            className={`btn ${ruleTab === "custom" ? "btn-primary" : "btn-outline"}`}
            style={{ flex: 1, padding: '8px' }}
            onClick={() => setRuleTab("custom")}
          >
            Custom
          </button>
          <button
            className={`btn ${ruleTab === "special" ? "btn-primary" : "btn-outline"}`}
            style={{ flex: 1, padding: '8px' }}
            onClick={() => setRuleTab("special")}
          >
            Speciali
          </button>
        </div>

        {ruleTab === "custom" ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', textAlign: 'center' }}>
              Componi la tua regola tra le opzioni uscite random!
            </p>
            
            <label style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>CHI:</label>
            <select
              className="player-input"
              value={customRuleDraft.part1}
              onChange={e => setCustomRuleDraft({ ...customRuleDraft, part1: e.target.value })}
            >
              {options.part1.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <label style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>CONDIZIONE:</label>
            <div className="player-input" style={{ opacity: 0.8, color: 'var(--accent)', fontWeight: 'bold' }}>
              {options.part2}
            </div>

            <label style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>CATEGORIA:</label>
            <select
              className="player-input"
              value={customRuleDraft.part3}
              onChange={e => setCustomRuleDraft({ ...customRuleDraft, part3: e.target.value })}
            >
              {options.part3.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>

            <button className="btn btn-primary" style={{ marginTop: '10px' }} onClick={() => {
              const label = CUSTOM_PART_3.find(c => c.key === customRuleDraft.part3)?.label;
              setActiveRules(prev => [...prev, {
                type: "custom",
                ...customRuleDraft,
                label: `${customRuleDraft.part1} ${customRuleDraft.part2} ${label}`
              }]);
              setShowRuleModal(false);
              nextTurn();
            }}>Applica Regola</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SPECIAL_RULES.map(sr => {
              const isActive = activeRules.some(r => r.key === sr.key);
              return (
                <button
                  key={sr.key}
                  className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '10px', display: 'flex', flexDirection: 'column', textAlign: 'left', opacity: isActive ? 0.5 : 1 }}
                  disabled={isActive}
                  onClick={() => {
                    setActiveRules(prev => [...prev, { type: "special", ...sr }]);
                    setShowRuleModal(false);
                    nextTurn();
                  }}
                >
                  <strong style={{ fontSize: '1rem' }}>{sr.title} {isActive && "✅"}</strong>
                  <span style={{ fontSize: '0.8rem', whiteSpace: 'normal', color: isActive ? '#fff' : 'var(--muted)' }}>{sr.desc}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
