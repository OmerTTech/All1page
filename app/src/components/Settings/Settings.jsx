import { useState } from "react";
import { t } from "../../i18n";

function Segmented({ options, value, onChange, title, hint }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--c-text-dim)] mb-2">
        {title}
      </label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.code}
            onClick={() => onChange(opt.code)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              value === opt.code
                ? "bg-gradient-to-br from-[#2f6bff] to-[#7a4dff] text-white shadow-md shadow-[#2f6bff]/25"
                : "bg-[var(--c-chip)] text-[var(--c-text-faint)] border border-[var(--c-border)] hover:border-[#4a7dfc]/40 hover:text-[var(--c-text)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {hint && <p className="mt-2 text-[11px] text-[var(--c-text-mute)]">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-chip)] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[var(--c-text)]">
          {label}
        </span>
        <button
          onClick={() => onChange(!checked)}
          className={`relative h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full transition-colors ${
            checked
              ? "bg-gradient-to-r from-[#2f6bff] to-[#7a4dff]"
              : "bg-[var(--c-border)]"
          }`}
          role="switch"
          aria-checked={checked}
        >
          <span
            className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${
              checked ? "left-[23px]" : "left-[3px]"
            }`}
          />
        </button>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-[var(--c-text-mute)]">
        {hint}
      </p>
    </div>
  );
}

function Section({ children }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function Divider() {
  return <div className="h-px bg-[var(--c-border-soft)]" />;
}

export default function Settings({
  open,
  onClose,
  lang,
  setLang,
  gap,
  setGap,
  startFullscreen,
  setStartFullscreen,
  rememberSession,
  setRememberSession,
  theme,
  setTheme,
}) {
  const [draftLang, setDraftLang] = useState(lang);
  const [draftGap, setDraftGap] = useState(gap);
  const [draftFs, setDraftFs] = useState(startFullscreen);
  const [draftRm, setDraftRm] = useState(rememberSession);
  const [draftTheme, setDraftTheme] = useState(theme);

  if (!open) return null;

  const save = () => {
    setLang(draftLang);
    setGap(draftGap);
    setStartFullscreen(draftFs);
    setRememberSession(draftRm);
    setTheme(draftTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* modal */}
      <div className="relative w-full max-w-[380px] rounded-2xl border border-[var(--c-border)] bg-[var(--c-modal)] shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--c-border-soft)]">
          <div>
            <span className="text-sm font-semibold text-[var(--c-text)]">
              {t(lang, "settingsTitle")}
            </span>
            <span className="block text-[10px] text-[var(--c-text-mute)] mt-0.5">
              {t(lang, "appName")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--c-text-mute)] hover:text-[var(--c-text)] hover:bg-[var(--c-chip)] text-sm cursor-pointer leading-none"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="px-5 py-4 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
          <Section>
            <Segmented
              title={t(lang, "language")}
              hint={t(lang, "languageHint")}
              value={draftLang}
              onChange={setDraftLang}
              options={[
                { code: "tr", label: "Türkçe" },
                { code: "en", label: "English" },
                { code: "az", label: "Azərbaycanca" },
              ]}
            />
            <Divider />
            <Segmented
              title={t(lang, "theme")}
              hint={t(lang, "themeHint")}
              value={draftTheme}
              onChange={setDraftTheme}
              options={[
                { code: "dark", label: t(draftLang, "dark") },
                { code: "light", label: t(draftLang, "light") },
              ]}
            />
            <Divider />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--c-text-dim)] mb-2">
                {t(draftLang, "gridGap")}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={draftGap}
                  onChange={(e) => setDraftGap(Number(e.target.value))}
                  className="flex-1 accent-[#4a7dfc]"
                />
                <span className="text-xs font-mono text-[var(--c-text-faint)] w-9 text-right tabular-nums">
                  {draftGap}px
                </span>
              </div>
              <p className="mt-2 text-[11px] text-[var(--c-text-mute)]">
                {t(draftLang, "gridGapHint")}
              </p>
            </div>
          </Section>

          <Section>
            <Toggle
              checked={draftFs}
              onChange={setDraftFs}
              label={t(draftLang, "startFullscreen")}
              hint={t(draftLang, "startFullscreenHint")}
            />
            <Toggle
              checked={draftRm}
              onChange={setDraftRm}
              label={t(draftLang, "remember")}
              hint={t(draftLang, "rememberHint")}
            />
          </Section>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--c-border)]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[var(--c-text-faint)] bg-[var(--c-chip)] border border-[var(--c-border)] cursor-pointer hover:text-[var(--c-text)]"
          >
            {t(draftLang, "close")}
          </button>
          <button
            onClick={save}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-br from-[#2f6bff] to-[#7a4dff] cursor-pointer hover:brightness-110 shadow-md shadow-[#2f6bff]/25"
          >
            {t(draftLang, "save")}
          </button>
        </div>
      </div>
    </div>
  );
}