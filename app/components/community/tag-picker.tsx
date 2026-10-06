"use client";

import { useState } from "react";

export function TagPicker({
  name,
  label,
  initialValues,
  options,
  placeholder,
}: {
  name: string;
  label: string;
  initialValues: string[];
  options: string[];
  placeholder: string;
}) {
  const [values, setValues] = useState(
    Array.from(new Set(initialValues.map((item) => item.trim()).filter(Boolean))),
  );
  const [draft, setDraft] = useState("");
  const add = (value: string) => {
    const normalized = value.trim();
    if (
      normalized &&
      !values.some(
        (item) =>
          item.localeCompare(normalized, undefined, { sensitivity: "accent" }) === 0,
      )
    )
      setValues([...values, normalized]);
    setDraft("");
  };
  return (
    <fieldset className="tag-picker">
      <legend>{label}</legend>
      <input name={name} type="hidden" value={values.join(",")} />
      <div className="tag-selected">
        {values.map((item) => (
          <button
            key={item}
            onClick={() => setValues(values.filter((value) => value !== item))}
            type="button"
          >
            {item} <span>×</span>
          </button>
        ))}
      </div>
      <div className="tag-options">
        {options
          .filter(
            (option) =>
              !values.some(
                (item) =>
                  item.localeCompare(option, undefined, { sensitivity: "accent" }) ===
                  0,
              ),
          )
          .map((option) => (
            <button key={option} onClick={() => add(option)} type="button">
              + {option}
            </button>
          ))}
      </div>
      <input
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            add(draft);
          }
        }}
        placeholder={placeholder}
        value={draft}
      />
    </fieldset>
  );
}
