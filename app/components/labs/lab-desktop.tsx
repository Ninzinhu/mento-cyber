"use client";

import {
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
  Maximize2,
  Minimize2,
  Monitor,
  Network,
  Play,
  RotateCw,
  Search,
  ShieldCheck,
  TerminalSquare,
  X,
} from "lucide-react";
import {
  FormEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { labChallenge, labSimulation, type Lab } from "../../features/labs/catalog";

type DesktopApp = "desktop" | "files" | "terminal" | "splunk" | "objective";

const actionLabels: Record<string, string> = {
  "desktop.boot": "Inicializar a estação",
  "files.open": "Abrir um artefato do caso",
  "terminal.inspect": "Inspecionar dados no terminal",
  "splunk.search": "Consultar os eventos no Splunk",
  "challenge.solve": "Validar a conclusão do cenário",
};

const safeCommands = [
  "help",
  "ls -la /case",
  "cat /case/briefing.txt",
  "cat /case/logs/auth.log",
  'grep -i "failed" /case/logs/auth.log',
  "clear",
];

export function LabDesktop({
  lab,
  active,
  completedActions,
  onAction,
  onComplete,
  onSolveChallenge,
  completing,
  challengeSolved,
}: {
  lab: Lab;
  active: boolean;
  completedActions: string[];
  onAction: (actionId: string) => void;
  onComplete: () => void;
  onSolveChallenge: (answer: string) => void;
  completing: boolean;
  challengeSolved: boolean;
}) {
  const simulation = labSimulation(lab);
  const challenge = labChallenge(lab);
  const desktopRef = useRef<HTMLElement>(null);
  const [app, setApp] = useState<DesktopApp>("desktop");
  const [booted, setBooted] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [windowOffset, setWindowOffset] = useState({ x: 0, y: 0 });
  const [dragOrigin, setDragOrigin] = useState<{
    pointerX: number;
    pointerY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState(0);
  const [command, setCommand] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "Kali Linux / MentoCyber Lab — ambiente sintético.",
    "Digite help ou escolha um comando pronto abaixo.",
  ]);
  const [query, setQuery] = useState("index=lab sourcetype=auth_logs");
  const [queryRan, setQueryRan] = useState(false);
  const [challengeAnswer, setChallengeAnswer] = useState("");

  const done = (id: string) => completedActions.includes(id);
  const progress = simulation.requiredActions.filter(done).length;
  const canComplete = active && progress === simulation.requiredActions.length;
  const artifact = lab.artifacts[selectedArtifact];
  const events = useMemo(
    () =>
      lab.artifacts.map((item, index) => ({
        time: `2026-10-06 08:${String(41 + index * 2).padStart(2, "0")}:1${index}`,
        host: `workstation-${String(index + 3).padStart(2, "0")}`,
        event: index % 2 === 0 ? "failed_login" : "evidence_loaded",
        detail: item.content,
      })),
    [lab.artifacts],
  );

  const record = (actionId: string) => {
    if (active && !done(actionId)) onAction(actionId);
  };
  const openApp = (nextApp: DesktopApp) => {
    setMinimized(false);
    setApp(nextApp);
  };
  const boot = () => {
    setBooted(true);
    record("desktop.boot");
  };
  const selectArtifact = (index: number) => {
    setSelectedArtifact(index);
    record("files.open");
  };

  const commandResult = (input: string) => {
    const normalized = input.trim().toLowerCase();
    const allEvents = events
      .map((event) => `${event.time} ${event.event} host=${event.host} ${event.detail}`)
      .join("\n");
    if (normalized === "help")
      return `Comandos simulados disponíveis:\n${safeCommands.join("\n")}`;
    if (normalized === "ls -la /case")
      return "drwxr-xr-x  evidence/\ndrwxr-xr-x  logs/\n-r--r-----  briefing.txt";
    if (normalized === "cat /case/briefing.txt")
      return `CASO: ${lab.title}\nOBJETIVO: ${lab.objective}\n\nDados criados somente para esta simulação.`;
    if (normalized === "cat /case/logs/auth.log") return allEvents;
    if (normalized === 'grep -i "failed" /case/logs/auth.log') {
      return events
        .filter((event) => event.event === "failed_login")
        .map((event) => `${event.time} failed_login host=${event.host}`)
        .join("\n");
    }
    return "Comando indisponível nesta estação. Use help para ver a lista segura.";
  };

  const runCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = command.trim();
    if (!input) return;
    if (input.toLowerCase() === "clear") {
      setTerminalOutput([]);
    } else {
      setTerminalOutput((current) => [
        ...current,
        `analyst@mc-lab:~$ ${input}`,
        commandResult(input),
      ]);
      if (safeCommands.includes(input.toLowerCase())) record("terminal.inspect");
    }
    setCommand("");
  };

  const runSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQueryRan(true);
    record("splunk.search");
  };

  const submitChallenge = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (challengeAnswer.trim().length < 3 || challengeSolved) return;
    onSolveChallenge(challengeAnswer.trim());
  };

  useEffect(() => {
    const updateFullscreenState = () =>
      setFullscreen(document.fullscreenElement === desktopRef.current);
    document.addEventListener("fullscreenchange", updateFullscreenState);
    return () =>
      document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  const toggleFullscreen = async () => {
    if (!desktopRef.current) return;
    if (document.fullscreenElement === desktopRef.current) {
      await document.exitFullscreen();
      return;
    }
    await desktopRef.current.requestFullscreen();
  };

  const startDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (maximized || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragOrigin({
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: windowOffset.x,
      offsetY: windowOffset.y,
    });
  };

  const dragWindow = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragOrigin || maximized) return;
    setWindowOffset({
      x: Math.max(
        -120,
        Math.min(360, dragOrigin.offsetX + event.clientX - dragOrigin.pointerX),
      ),
      y: Math.max(
        -8,
        Math.min(210, dragOrigin.offsetY + event.clientY - dragOrigin.pointerY),
      ),
    });
  };

  const stopDragging = () => setDragOrigin(null);

  return (
    <section
      ref={desktopRef}
      className={`lab-desktop kali-desktop${booted ? " is-booted" : ""}`}
      aria-label="Estação simulada do laboratório"
    >
      <header className="kali-topbar">
        <div>
          <span className="sim-led" />
          <b>KALI LINUX</b>
          <small>MC-LAB / {lab.id.toUpperCase()}</small>
        </div>
        <p>analyst@mc-lab · {booted ? "estação ativa" : "estação bloqueada"}</p>
        <div className="kali-topbar-actions">
          <span className="kali-isolated">
            <Network size={12} /> ISOLADO
          </span>
          <button
            aria-label={fullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"}
            onClick={toggleFullscreen}
            type="button"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </header>

      {!booted ? (
        <div className="desktop-boot kali-boot">
          <Monitor size={46} strokeWidth={1.15} />
          <p>AMBIENTE DE TREINAMENTO</p>
          <strong>{lab.title}</strong>
          <span>
            Uma estação inspirada em Kali Linux, mas inteiramente executada no navegador
            com arquivos e registros sintéticos.
          </span>
          <button disabled={!active} onClick={boot} type="button">
            <Play size={16} /> Ligar estação
          </button>
          {!active && <small>Inicie o lab para desbloquear a estação.</small>}
        </div>
      ) : (
        <div className="kali-shell">
          <div className="kali-workspace">
            <div className="kali-wallpaper-mark" aria-hidden="true">
              K
            </div>
            <div className="kali-desktop-icons" aria-label="Ícones da área de trabalho">
              <DesktopIcon
                icon={<FolderOpen />}
                label="Arquivos do caso"
                onClick={() => openApp("files")}
              />
              <DesktopIcon
                icon={<TerminalSquare />}
                label="Terminal"
                onClick={() => openApp("terminal")}
              />
              <DesktopIcon
                icon={<Search />}
                label="Splunk"
                onClick={() => openApp("splunk")}
              />
              <DesktopIcon
                icon={<CircleHelp />}
                label="Objetivo"
                onClick={() => openApp("objective")}
              />
            </div>

            {app === "desktop" && (
              <div className="kali-welcome-window">
                <span>MC-LAB // {lab.category}</span>
                <h2>{lab.title}</h2>
                <p>
                  Use os ícones da área de trabalho para abrir as ferramentas do caso.
                </p>
                <button onClick={() => openApp("splunk")} type="button">
                  <Search size={15} /> Abrir Splunk
                </button>
              </div>
            )}

            {app !== "desktop" && !minimized && (
              <div
                className={`kali-window kali-window-${app}${maximized ? " is-maximized" : ""}`}
                style={
                  maximized
                    ? undefined
                    : {
                        transform: `translate(${windowOffset.x}px, ${windowOffset.y}px)`,
                      }
                }
              >
                <div
                  className={`kali-window-titlebar${dragOrigin ? " is-dragging" : ""}`}
                  onPointerDown={startDragging}
                  onPointerMove={dragWindow}
                  onPointerUp={stopDragging}
                  onPointerCancel={stopDragging}
                >
                  <span>
                    {app === "files"
                      ? "Arquivos do caso"
                      : app === "terminal"
                        ? "Terminal"
                        : app === "splunk"
                          ? "Splunk Enterprise"
                          : "Objetivo da operação"}
                  </span>
                  <div className="kali-window-controls">
                    <button
                      aria-label="Minimizar janela"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => setMinimized(true)}
                      type="button"
                    >
                      <Minimize2 size={14} />
                    </button>
                    <button
                      aria-label={maximized ? "Restaurar janela" : "Maximizar janela"}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => setMaximized((current) => !current)}
                      type="button"
                    >
                      <Maximize2 size={13} />
                    </button>
                    <button
                      aria-label="Fechar janela"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => openApp("desktop")}
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                {app === "files" && (
                  <div className="kali-files-app">
                    <aside>
                      <p>LOCAIS</p>
                      <button type="button">
                        <Folder size={15} /> /home/analyst
                      </button>
                      <button className="active" type="button">
                        <FolderOpen size={15} /> /case
                      </button>
                      <button type="button">
                        <Folder size={15} /> /case/evidence
                      </button>
                      <button type="button">
                        <Folder size={15} /> /case/logs
                      </button>
                    </aside>
                    <div className="kali-file-browser">
                      <div className="kali-path">
                        <ChevronLeft size={14} />
                        <ChevronRight size={14} />
                        <span>/case/evidence</span>
                      </div>
                      <div className="kali-file-grid">
                        {lab.artifacts.map((item, index) => (
                          <button
                            className={selectedArtifact === index ? "selected" : ""}
                            key={item.label}
                            onClick={() => selectArtifact(index)}
                            type="button"
                          >
                            {index % 2 === 0 ? (
                              <FileText size={28} />
                            ) : (
                              <FileCode2 size={28} />
                            )}
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                      <article className="kali-file-preview">
                        <p>PRÉ-VISUALIZAÇÃO</p>
                        <strong>{artifact.title}</strong>
                        <pre>{artifact.content}</pre>
                      </article>
                    </div>
                  </div>
                )}
                {app === "terminal" && (
                  <div className="kali-terminal-app">
                    <div className="terminal-banner">
                      <span>analyst@mc-lab</span>:~$ <em>shell simulado</em>
                    </div>
                    <pre aria-live="polite">{terminalOutput.join("\n\n") || " "}</pre>
                    <div className="terminal-shortcuts" aria-label="Comandos prontos">
                      {safeCommands.slice(1, -1).map((item) => (
                        <button
                          key={item}
                          onClick={() => setCommand(item)}
                          type="button"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <form onSubmit={runCommand}>
                      <span>analyst@mc-lab:~$</span>
                      <input
                        autoComplete="off"
                        onChange={(event) => setCommand(event.target.value)}
                        placeholder="Digite help"
                        spellCheck={false}
                        value={command}
                      />
                      <button type="submit">Rodar</button>
                    </form>
                  </div>
                )}
                {app === "splunk" && (
                  <div className="kali-splunk-app">
                    <div className="splunk-browser-bar">
                      <ChevronLeft size={15} />
                      <ChevronRight size={15} />
                      <RotateCw size={14} />
                      <span>
                        <ShieldCheck size={13} />{" "}
                        https://splunk.lab.local/en-US/app/search
                      </span>
                    </div>
                    <div className="splunk-product-bar">
                      <b>splunk&gt;</b>
                      <small>Search & Reporting</small>
                      <span>analyst</span>
                    </div>
                    <form onSubmit={runSearch}>
                      <input
                        onChange={(event) => setQuery(event.target.value)}
                        spellCheck={false}
                        value={query}
                      />
                      <button type="submit">
                        <Search size={15} /> Pesquisar
                      </button>
                    </form>
                    <div className="splunk-meta">
                      <b>{events.length} eventos</b>
                      <span>
                        {queryRan
                          ? "consulta aplicada ao conjunto local"
                          : "logs do caso já carregados"}
                      </span>
                    </div>
                    <div
                      className="splunk-table"
                      role="table"
                      aria-label="Eventos simulados do Splunk"
                    >
                      <div className="splunk-row splunk-heading" role="row">
                        <span>_time</span>
                        <span>host</span>
                        <span>event_type</span>
                        <span>evento</span>
                      </div>
                      {events.map((event) => (
                        <div
                          className="splunk-row"
                          key={`${event.time}-${event.host}`}
                          role="row"
                        >
                          <span>{event.time}</span>
                          <span>{event.host}</span>
                          <span>{event.event}</span>
                          <span>{event.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {app === "objective" && (
                  <div className="kali-objective-app">
                    <p className="auth-eyebrow">ROTEIRO DE INVESTIGAÇÃO</p>
                    <h2>{lab.objective}</h2>
                    <ol>
                      {simulation.requiredActions.map((item, index) => (
                        <li className={done(item) ? "done" : ""} key={item}>
                          <span>
                            {done(item) ? "✓" : String(index + 1).padStart(2, "0")}
                          </span>
                          {actionLabels[item] || item}
                        </li>
                      ))}
                    </ol>
                    <form className="kali-challenge" onSubmit={submitChallenge}>
                      <p>CONFIRMAÇÃO DE DIAGNÓSTICO</p>
                      <strong>{challenge.prompt}</strong>
                      <span>Dica: {challenge.hint}</span>
                      <div>
                        <input
                          disabled={challengeSolved}
                          onChange={(event) => setChallengeAnswer(event.target.value)}
                          placeholder={challenge.placeholder}
                          value={challengeAnswer}
                        />
                        <button disabled={challengeSolved} type="submit">
                          {challengeSolved ? "Conclusão validada" : "Validar"}
                        </button>
                      </div>
                    </form>
                    <button
                      disabled={!canComplete || completing}
                      onClick={onComplete}
                      type="button"
                    >
                      <ShieldCheck size={16} />{" "}
                      {completing
                        ? "Validando…"
                        : `Concluir operação +${simulation.xp} XP`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <nav className="kali-taskbar" aria-label="Aplicações abertas">
            <button
              aria-label="Área de trabalho"
              className={app === "desktop" ? "active" : ""}
              onClick={() => openApp("desktop")}
              type="button"
            >
              <Monitor size={17} />
            </button>
            <button
              aria-label="Arquivos"
              className={app === "files" ? "active" : ""}
              onClick={() => openApp("files")}
              type="button"
            >
              <FolderOpen size={17} />
            </button>
            <button
              aria-label="Terminal"
              className={app === "terminal" ? "active" : ""}
              onClick={() => openApp("terminal")}
              type="button"
            >
              <TerminalSquare size={17} />
            </button>
            <button
              aria-label="Splunk"
              className={app === "splunk" ? "active" : ""}
              onClick={() => openApp("splunk")}
              type="button"
            >
              <Search size={17} />
            </button>
            <button
              aria-label="Objetivo"
              className={app === "objective" ? "active" : ""}
              onClick={() => openApp("objective")}
              type="button"
            >
              <CircleHelp size={17} />
            </button>
            {minimized && (
              <span className="kali-minimized-label">
                {app === "splunk" ? "Splunk minimizado" : "Janela minimizada"}
              </span>
            )}
            <span>
              {progress}/{simulation.requiredActions.length} ações
            </span>
          </nav>
        </div>
      )}
      <footer>
        <ShieldCheck size={14} /> Estação simulada: não há shell real, exploração, rede
        externa ou coleta de dados.
      </footer>
    </section>
  );
}

function DesktopIcon({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="kali-desktop-icon" onClick={onClick} type="button">
      <span>{icon}</span>
      <small>{label}</small>
    </button>
  );
}
