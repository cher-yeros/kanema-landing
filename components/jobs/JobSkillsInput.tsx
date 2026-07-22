"use client";

import { useState, type KeyboardEvent } from "react";

const MAX_SKILLS = 12;
const MAX_SKILL_LENGTH = 48;

type Props = {
  value: string[];
  onChange: (skills: string[]) => void;
  suggestions?: string[];
};

function normalizeSkill(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, MAX_SKILL_LENGTH);
}

export function JobSkillsInput({
  value,
  onChange,
  suggestions = [],
}: Props) {
  const [draft, setDraft] = useState("");

  function addSkill(raw: string) {
    const skill = normalizeSkill(raw);
    if (!skill) return;
    const exists = value.some(
      (item) => item.toLowerCase() === skill.toLowerCase(),
    );
    if (exists || value.length >= MAX_SKILLS) {
      setDraft("");
      return;
    }
    onChange([...value, skill]);
    setDraft("");
  }

  function removeSkill(skill: string) {
    onChange(value.filter((item) => item !== skill));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addSkill(draft);
      return;
    }
    if (event.key === "Backspace" && !draft && value.length > 0) {
      removeSkill(value[value.length - 1]);
    }
  }

  const availableSuggestions = suggestions.filter(
    (suggestion) =>
      !value.some((item) => item.toLowerCase() === suggestion.toLowerCase()),
  );

  return (
    <div className="job-skills-input">
      <label className="form-label" htmlFor="job-skills">
        Skills
      </label>
      <div className="job-skills-input__box">
        {value.map((skill) => (
          <button
            key={skill}
            type="button"
            className="job-skills-input__chip"
            onClick={() => removeSkill(skill)}
            aria-label={`Remove ${skill}`}
          >
            {skill}
            <i className="bi bi-x" aria-hidden />
          </button>
        ))}
        <input
          id="job-skills"
          className="job-skills-input__field"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            if (draft.trim()) addSkill(draft);
          }}
          placeholder={
            value.length === 0
              ? "Add skills and press Enter"
              : value.length >= MAX_SKILLS
                ? "Skill limit reached"
                : "Add another skill…"
          }
          disabled={value.length >= MAX_SKILLS}
          autoComplete="off"
        />
      </div>
      <p className="small text-muted mt-2 mb-0">
        Up to {MAX_SKILLS} skills. Press Enter or comma to add.
      </p>
      {availableSuggestions.length > 0 ? (
        <div className="job-skills-input__suggestions">
          {availableSuggestions.slice(0, 10).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="job-skills-input__suggestion"
              onClick={() => addSkill(suggestion)}
              disabled={value.length >= MAX_SKILLS}
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
