"use client";

import { useEffect, useState } from "react";
import { observeCommunityMember } from "../../features/community/community-data";
import { communityAction } from "../../features/community/server-action";

type Report = {
  id: string;
  targetId: string;
  targetType: "post" | "comment";
  reason: string;
  reporterId: string;
};

export function ModerationConsole() {
  const [reports, setReports] = useState<Report[]>([]);
  const [notice, setNotice] = useState(
    "Entre com uma conta da equipe para consultar a fila.",
  );

  async function loadQueue() {
    try {
      const data = await communityAction<{ items: Report[] }>("moderation.queue");
      setReports(data.items || []);
      setNotice(data.items?.length ? "Fila atualizada." : "Nenhuma denúncia pendente.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível carregar a fila.",
      );
    }
  }

  useEffect(
    () =>
      observeCommunityMember((member) => {
        if (member) void loadQueue();
      }),
    [],
  );

  async function resolve(reportId: string, decision: "hide" | "dismiss") {
    try {
      await communityAction("moderation.resolve", { reportId, decision });
      setReports((items) => items.filter((report) => report.id !== reportId));
      setNotice(
        decision === "hide"
          ? "Conteúdo ocultado e ação registrada."
          : "Denúncia descartada e ação registrada.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a moderação.",
      );
    }
  }

  return (
    <section className="moderation-console">
      <div className="moderation-console__header">
        <div>
          <p className="auth-eyebrow">EQUIPE / MODERAÇÃO</p>
          <h1>Fila de segurança da comunidade.</h1>
          <p>
            Decisões são registradas no servidor. Este painel não concede privilégios
            por interface.
          </p>
        </div>
        <button type="button" onClick={() => void loadQueue()}>
          Atualizar fila
        </button>
      </div>
      <p className="moderation-console__notice" aria-live="polite">
        {notice}
      </p>
      <div className="moderation-console__list">
        {reports.map((report) => (
          <article key={report.id}>
            <div>
              <span>{report.targetType === "post" ? "PUBLICAÇÃO" : "COMENTÁRIO"}</span>
              <b>{report.reason}</b>
              <small>Referência: {report.targetId}</small>
            </div>
            <div>
              <button type="button" onClick={() => void resolve(report.id, "dismiss")}>
                Descartar
              </button>
              <button type="button" onClick={() => void resolve(report.id, "hide")}>
                Ocultar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
