"use client";

import { useEffect, useState } from "react";

const palettes = [
  {
    id: "orchid",
    name: "Orquídea elétrica",
    description: "Ameixa mineral, verde lima e azul névoa.",
    colors: ["#2d1838", "#d7ff5f", "#c9d9ff"],
  },
  {
    id: "ember",
    name: "Brasa líquida",
    description: "Carvão violeta, cobre vivo e água-glacial.",
    colors: ["#21172f", "#ff7657", "#c1fff5"],
  },
  {
    id: "lichen",
    name: "Líquen cósmico",
    description: "Verde fóssil, lavanda ácida e amarelo solar.",
    colors: ["#1b2b25", "#d3a8ff", "#fff08a"],
  },
];

export function BrandLab() {
  const [activePalette, setActivePalette] = useState("lichen");

  useEffect(() => {
    document.documentElement.dataset.brand = activePalette;
  }, [activePalette]);

  return (
    <section className="brand-lab" aria-labelledby="brand-lab-title">
      <div className="wrap">
        <div className="kicker">Laboratório de marca</div>
        <div className="brand-lab-heading">
          <div>
            <h2 id="brand-lab-title">Cores fora do piloto automático.</h2>
            <p>
              Três direções experimentais para testar a personalidade da MentoCyber no
              produto, não apenas em uma prancha estática.
            </p>
          </div>
          <span className="brand-lab-note">SELECIONE UMA PALETA</span>
        </div>
        <div className="palette-grid">
          {palettes.map((palette) => {
            const isActive = activePalette === palette.id;

            return (
              <button
                aria-pressed={isActive}
                className={`palette-card ${isActive ? "is-active" : ""}`}
                key={palette.id}
                onClick={() => setActivePalette(palette.id)}
                type="button"
              >
                <span className="palette-colors" aria-hidden="true">
                  {palette.colors.map((color) => (
                    <span key={color} style={{ backgroundColor: color }} />
                  ))}
                </span>
                <strong>{palette.name}</strong>
                <span>{palette.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
