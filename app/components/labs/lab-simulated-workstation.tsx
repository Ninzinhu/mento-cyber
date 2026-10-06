"use client";

import {
  BookOpenText,
  FileSearch,
  FolderSearch,
  Globe2,
  Network,
  Route,
  ScrollText,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";
import { useState } from "react";
import type { Lab, LabCategory } from "../../features/labs/catalog";

type Tool = {
  id: "evidence" | "timeline" | "map" | "notes";
  label: string;
  icon: typeof TerminalSquare;
};

const toolsByCategory: Record<LabCategory, Tool[]> = {
  Detecção: [
    { id: "evidence", label: "Eventos", icon: TerminalSquare },
    { id: "timeline", label: "Linha do tempo", icon: Route },
    { id: "notes", label: "Caderno", icon: BookOpenText },
  ],
  Web: [
    { id: "evidence", label: "Sessão", icon: Globe2 },
    { id: "timeline", label: "Cabeçalhos", icon: ScrollText },
    { id: "notes", label: "Caderno", icon: BookOpenText },
  ],
  Forense: [
    { id: "evidence", label: "Evidências", icon: FolderSearch },
    { id: "timeline", label: "Linha do tempo", icon: Route },
    { id: "notes", label: "Caderno", icon: BookOpenText },
  ],
  OSINT: [
    { id: "evidence", label: "Fontes", icon: FileSearch },
    { id: "map", label: "Relações", icon: Network },
    { id: "notes", label: "Caderno", icon: BookOpenText },
  ],
  Redes: [
    { id: "map", label: "Topologia", icon: Network },
    { id: "evidence", label: "Fluxos", icon: Route },
    { id: "notes", label: "Caderno", icon: BookOpenText },
  ],
  Cloud: [
    { id: "evidence", label: "Auditoria", icon: ShieldCheck },
    { id: "timeline", label: "Identidades", icon: FileSearch },
    { id: "notes", label: "Caderno", icon: BookOpenText },
  ],
};

function MapView({ lab }: { lab: Lab }) {
  return (
    <div className="sim-map" aria-label="Mapa simulado do cenário">
      <span>{lab.category.toUpperCase()}</span>
      <i />
      <i />
      <i />
      <b>AMB. SIMULADO</b>
      <b>CAMADA DE ANÁLISE</b>
      <b>REGISTRO</b>
    </div>
  );
}

export function LabSimulatedWorkstation({ lab }: { lab: Lab }) {
  const tools = toolsByCategory[lab.category];
  const [activeTool, setActiveTool] = useState<Tool["id"]>(tools[0].id);
  const [notes, setNotes] = useState("");
  const active = tools.find((tool) => tool.id === activeTool) || tools[0];
  const ActiveIcon = active.icon;

  return (
    <section className="sim-workstation" aria-label="Estação simulada de análise">
      <header>
        <div>
          <span className="sim-led" />
          <p>ESTAÇÃO DE ANÁLISE / {lab.id.toUpperCase()}</p>
        </div>
        <small>REDE EXTERNA: BLOQUEADA</small>
      </header>
      <div className="sim-workstation-body">
        <nav aria-label="Ferramentas simuladas">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                aria-pressed={activeTool === tool.id}
                className={activeTool === tool.id ? "is-active" : ""}
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                type="button"
              >
                <Icon size={17} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sim-screen">
          <div className="sim-screen-title">
            <ActiveIcon size={16} />
            <span>{active.label}</span>
            <em>SIMULADO</em>
          </div>
          {activeTool === "notes" ? (
            <label className="sim-notes">
              <span>Suas notas de análise</span>
              <textarea
                maxLength={1200}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Registre sinais, hipóteses e perguntas. Estas notas ficam somente nesta sessão do navegador."
                value={notes}
              />
              <small>{notes.length}/1200</small>
            </label>
          ) : activeTool === "map" ? (
            <MapView lab={lab} />
          ) : (
            <div
              className={activeTool === "timeline" ? "sim-timeline" : "sim-evidence"}
            >
              {lab.artifacts.map((artifact, index) => (
                <article key={artifact.label}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <b>{artifact.title}</b>
                    <p>{artifact.content}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      <footer>
        <ShieldCheck size={14} aria-hidden="true" />
        Dados criados para este cenário. Nenhuma ação executa comandos, acessa rede ou
        coleta dados.
      </footer>
    </section>
  );
}
