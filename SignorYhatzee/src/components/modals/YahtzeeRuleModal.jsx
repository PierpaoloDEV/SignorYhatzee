import { useState } from "react";
import { CUSTOM_PART_1, CUSTOM_PART_2, CUSTOM_PART_3, SPECIAL_RULES } from "../../constants";

export default function YahtzeeRuleModal({ state }) {
  const { showRuleModal, setShowRuleModal, activeRules, setActiveRules, nextTurn } = state;
  const [ruleTab, setRuleTab] = useState("custom");
  const [customRuleDraft, setCustomRuleDraft] = useState({ part1: CUSTOM_PART_1[0], part2: CUSTOM_PART_2[0], part3: CUSTOM_PART_3[0].key });

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
              Componi la tua regola, verrà applicata in automatico.
            </p>
            <select
              className="player-input"
              value={customRuleDraft.part1}
              onChange={e => setCustomRuleDraft({ ...customRuleDraft, part1: e.target.value })}
            >
              {CUSTOM_PART_1.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              className="player-input"
              value={customRuleDraft.part2}
              onChange={e => setCustomRuleDraft({ ...customRuleDraft, part2: e.target.value })}
            >
              {CUSTOM_PART_2.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              className="player-input"
              value={customRuleDraft.part3}
              onChange={e => setCustomRuleDraft({ ...customRuleDraft, part3: e.target.value })}
            >
              {CUSTOM_PART_3.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
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
