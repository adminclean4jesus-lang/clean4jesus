import type { Session } from "@supabase/supabase-js";
import { AlertTriangle, CheckCircle2, Clock3, EyeOff, FileWarning, LogOut, RefreshCw, SearchCheck, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  applyAction,
  applyFalsePositiveAction,
  type CaseStatus,
  type FalsePositiveReviewAction,
  type FalsePositiveReviewCase,
  type FalsePositiveReviewStatus,
  getModeratorAccess,
  listFalsePositiveCases,
  listCases,
  type ModerationAction,
  type ModerationCase,
  type ModeratorRole,
} from "./moderationService";
import { configurationError, supabase } from "./supabase";
import { TurnstileChallenge } from "./TurnstileChallenge";

type AccessState =
  | { kind: "checking" }
  | { kind: "denied"; message: string }
  | { factorId: string; kind: "challenge"; role: ModeratorRole }
  | { factorId: string; kind: "enroll"; qrCode: string; role: ModeratorRole; secret: string }
  | { kind: "ready"; role: ModeratorRole };

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const isRecoveryRoute = window.location.pathname === "/reset-password";

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  if (configurationError) return <CenteredState title="Configuracion pendiente" body={configurationError} />;
  if (loadingSession) return <CenteredState title="Verificando sesion" body="Preparando el entorno interno de Clean4Jesus." />;
  if (isRecoveryRoute) return <PasswordRecovery />;
  if (!session) return <Login />;
  return <ModeratorSession key={session.user.id} session={session} />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recoveryRequested, setRecoveryRequested] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaRound, setCaptchaRound] = useState(0);

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaRound((round) => round + 1);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    if (!captchaToken) {
      setError("Completa la verificacion de seguridad antes de continuar.");
      setSubmitting(false);
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
      options: { captchaToken },
    });
    if (authError) setError("El correo o la contrasena no coinciden, o la cuenta no esta confirmada.");
    resetCaptcha();
    setSubmitting(false);
  }

  async function requestRecovery() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || submitting) {
      setError("Escribe tu correo para enviarte un enlace de recuperación.");
      return;
    }
    if (!captchaToken) {
      setError("Completa la verificacion de seguridad antes de solicitar el enlace.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
      captchaToken,
    });
    if (recoveryError) setError("No pudimos enviar el enlace. Completa el desafio otra vez e intenta de nuevo.");
    else setRecoveryRequested(true);
    resetCaptcha();
    setSubmitting(false);
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <Brand />
        <div className="auth-copy">
          <p className="eyebrow">Acceso interno</p>
          <h1>Moderacion con cuidado y trazabilidad</h1>
          <p>Solo cuentas autorizadas. Cada accion queda registrada y requiere verificacion en dos pasos.</p>
        </div>
        <form className="form-stack" onSubmit={submit}>
          <label>Correo<input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
          <label>Contrasena<input autoComplete="current-password" minLength={10} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
          <TurnstileChallenge key={captchaRound} onError={resetCaptcha} onToken={setCaptchaToken} />
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="primary-button" disabled={submitting} type="submit">{submitting ? "Verificando..." : "Entrar de forma segura"}</button>
          <button className="text-button" disabled={submitting} onClick={() => void requestRecovery()} type="button">Olvidé mi contraseña</button>
          {recoveryRequested ? <p className="form-success">Si existe una cuenta con ese correo, enviamos un enlace seguro de recuperación.</p> : null}
        </form>
      </section>
      <aside className="auth-aside" aria-label="Principios de moderacion">
        <ShieldCheck size={34} />
        <h2>La persona antes que la publicacion.</h2>
        <p>La consola muestra solo la evidencia necesaria para resolver un reporte. No expone correos ni la identidad de quien reporta.</p>
      </aside>
    </main>
  );
}

function PasswordRecovery() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(Boolean(session));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || submitting) return;
    if (password.length < 10) {
      setError("La contraseña debe tener al menos 10 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError("No pudimos cambiar la contraseña. Solicita un enlace nuevo e inténtalo otra vez.");
    else setMessage("Contraseña actualizada. Ya puedes volver a iniciar sesión en la consola.");
    setSubmitting(false);
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <Brand />
        <div className="auth-copy">
          <p className="eyebrow">Acceso interno</p>
          <h1>Restablece tu contraseña</h1>
          <p>El enlace es personal y temporal. Elige una contraseña nueva para continuar con la moderación.</p>
        </div>
        {message ? (
          <div className="recovery-complete"><p>{message}</p><a className="primary-button" href="/">Ir al inicio de sesión</a></div>
        ) : !ready ? (
          <div className="recovery-complete"><p>Este enlace venció, ya fue usado o no es válido. Vuelve a la consola y solicita uno nuevo.</p><a className="secondary-button" href="/">Volver a la consola</a></div>
        ) : (
          <form className="form-stack" onSubmit={submit}>
            <label>Nueva contraseña<input autoComplete="new-password" minLength={10} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
            <label>Confirmar contraseña<input autoComplete="new-password" minLength={10} onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} /></label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="primary-button" disabled={submitting} type="submit">{submitting ? "Actualizando..." : "Guardar nueva contraseña"}</button>
          </form>
        )}
      </section>
      <aside className="auth-aside" aria-label="Seguridad de acceso">
        <ShieldCheck size={34} />
        <h2>La seguridad también acompaña.</h2>
        <p>La contraseña protege el acceso. Después seguirás necesitando tu segundo factor para moderar.</p>
      </aside>
    </main>
  );
}

function ModeratorSession({ session }: { session: Session }) {
  const [access, setAccess] = useState<AccessState>({ kind: "checking" });

  const inspectAccess = useCallback(async () => {
    setAccess({ kind: "checking" });
    try {
      const moderatorAccess = await getModeratorAccess();
      const [{ data: assurance, error: assuranceError }, { data: factors, error: factorsError }] = await Promise.all([
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.mfa.listFactors(),
      ]);
      if (assuranceError || factorsError) throw new Error("No pudimos verificar el segundo factor.");
      if (assurance.currentLevel === "aal2") {
        setAccess({ kind: "ready", role: moderatorAccess.role });
        return;
      }
      const verifiedFactor = factors.totp.find((factor) => factor.status === "verified");
      if (verifiedFactor) {
        setAccess({ factorId: verifiedFactor.id, kind: "challenge", role: moderatorAccess.role });
        return;
      }
      const incompleteConsoleFactors = factors.totp.filter(
        (factor) => factor.status !== "verified" && factor.friendly_name === "Consola Clean4Jesus",
      );
      for (const factor of incompleteConsoleFactors) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (unenrollError) throw unenrollError;
      }
      const { data: enrollment, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Consola Clean4Jesus" });
      if (error) throw error;
      setAccess({
        factorId: enrollment.id,
        kind: "enroll",
        qrCode: enrollment.totp.qr_code,
        role: moderatorAccess.role,
        secret: enrollment.totp.secret,
      });
    } catch (error) {
      setAccess({ kind: "denied", message: error instanceof Error ? error.message : "Acceso no autorizado." });
    }
  }, []);

  useEffect(() => { void inspectAccess(); }, [inspectAccess]);

  if (access.kind === "checking") return <CenteredState title="Comprobando permisos" body="Validando rol, sesion activa y segundo factor." />;
  if (access.kind === "denied") {
    return <CenteredState title="Acceso no autorizado" body={access.message} action={<SignOutButton />} />;
  }
  if (access.kind === "challenge" || access.kind === "enroll") {
    return <MfaGate access={access} email={session.user.email ?? "cuenta interna"} onVerified={inspectAccess} />;
  }
  return <ModerationDashboard email={session.user.email ?? "cuenta interna"} role={access.role} />;
}

function MfaGate({ access, email, onVerified }: {
  access: Extract<AccessState, { kind: "challenge" | "enroll" }>;
  email: string;
  onVerified: () => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code) || submitting) {
      setError("Escribe el codigo de 6 digitos de tu autenticador.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId: access.factorId, code });
    if (verifyError) {
      setError("El codigo no fue valido o ya vencio. Usa el codigo actual.");
      setSubmitting(false);
      return;
    }
    await onVerified();
  }

  return (
    <main className="security-shell">
      <section className="security-panel">
        <Brand />
        <div className="security-icon"><ShieldCheck /></div>
        <p className="eyebrow">Segundo factor obligatorio</p>
        <h1>{access.kind === "enroll" ? "Protege tu cuenta de moderacion" : "Confirma que eres tu"}</h1>
        <p>Sesión: <strong>{email}</strong>. La contraseña por sí sola no permite revisar ni modificar reportes.</p>
        {access.kind === "enroll" ? (
          <div className="enrollment">
            <img alt="Codigo QR para configurar MFA" src={access.qrCode} />
            <div><span>Alternativa manual</span><code>{access.secret}</code></div>
          </div>
        ) : null}
        <form className="mfa-form" onSubmit={verify}>
          <label>Codigo del autenticador<input autoComplete="one-time-code" inputMode="numeric" maxLength={6} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" value={code} /></label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="primary-button" disabled={submitting} type="submit">{submitting ? "Comprobando..." : "Verificar y continuar"}</button>
        </form>
        <SignOutButton />
      </section>
    </main>
  );
}

function ModerationDashboard({ email, role }: { email: string; role: ModeratorRole }) {
  const [queue, setQueue] = useState<"community" | "false_positive">("community");
  const [status, setStatus] = useState<CaseStatus>("pending");
  const [cases, setCases] = useState<ModerationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ModerationCase | null>(null);
  const [action, setAction] = useState<ModerationAction | null>(null);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);
  const requestInFlight = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCases(await listCases(status));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No pudimos cargar la cola.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  async function confirmAction() {
    if (!selected || !action || note.trim().length < 3 || requestInFlight.current) return;
    requestInFlight.current = true;
    setActing(true);
    setError(null);
    try {
      await applyAction(selected, action, note.trim());
      setSelected(null);
      setAction(null);
      setNote("");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No pudimos aplicar la accion.");
    } finally {
      requestInFlight.current = false;
      setActing(false);
    }
  }

  const summary = useMemo(() => ({ pending: cases.length, reports: cases.reduce((total, item) => total + item.report_count, 0) }), [cases]);

  return (
    <div className="console-shell">
      <header className="topbar">
        <Brand />
        <div className="operator"><div><strong>{email}</strong><span>{role === "admin" ? "Administrador" : "Moderador"} · MFA verificado</span></div><SignOutButton compact /></div>
      </header>
      <nav className="queue-tabs" aria-label="Colas de moderacion">
        <button aria-current={queue === "community" ? "page" : undefined} className={queue === "community" ? "active" : ""} onClick={() => setQueue("community")}>Comunidad</button>
        <button aria-current={queue === "false_positive" ? "page" : undefined} className={queue === "false_positive" ? "active" : ""} onClick={() => setQueue("false_positive")}>Falsos positivos</button>
      </nav>
      {queue === "community" ? <main className="workspace">
        <section className="workspace-heading">
          <div><p className="eyebrow">Cola comunitaria</p><h1>Decisiones claras, evidencia mínima</h1><p>Revisa contexto, aplica la menor intervención necesaria y documenta el motivo.</p></div>
          <button className="icon-button" onClick={() => void load()} title="Actualizar cola"><RefreshCw size={18} /></button>
        </section>
        <section className="metrics" aria-label="Resumen de la cola">
          <Metric icon={<Clock3 />} label="Casos en esta vista" value={summary.pending} />
          <Metric icon={<AlertTriangle />} label="Reportes agrupados" value={summary.reports} />
          <Metric icon={<ShieldCheck />} label="Sesion" value="AAL2" />
        </section>
        <nav className="status-tabs" aria-label="Estado de casos">
          {(["pending", "in_review", "resolved", "dismissed"] as CaseStatus[]).map((item) => (
            <button aria-current={status === item ? "page" : undefined} className={status === item ? "active" : ""} key={item} onClick={() => setStatus(item)}>{statusLabel(item)}</button>
          ))}
        </nav>
        {error ? <div className="error-banner" role="alert"><AlertTriangle size={18} />{error}</div> : null}
        {loading ? <CenteredState compact title="Cargando casos" body="Consultando la cola protegida." /> : cases.length === 0 ? <EmptyQueue /> : (
          <section className="case-list">
            {cases.map((item) => <CaseRow key={item.id} moderationCase={item} onAction={(nextAction) => { setSelected(item); setAction(nextAction); setNote(""); }} role={role} />)}
          </section>
        )}
      </main> : <FalsePositiveDashboard role={role} />}
      {queue === "community" && selected && action ? <ActionDialog action={action} acting={acting} moderationCase={selected} note={note} onCancel={() => { setSelected(null); setAction(null); }} onConfirm={() => void confirmAction()} onNoteChange={setNote} /> : null}
    </div>
  );
}

function FalsePositiveDashboard({ role }: { role: ModeratorRole }) {
  const [status, setStatus] = useState<FalsePositiveReviewStatus>("pending");
  const [cases, setCases] = useState<FalsePositiveReviewCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FalsePositiveReviewCase | null>(null);
  const [action, setAction] = useState<FalsePositiveReviewAction | null>(null);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);
  const requestInFlight = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCases(await listFalsePositiveCases(status));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No pudimos cargar las senales del filtro.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  async function confirmAction() {
    if (!selected || !action || note.trim().length < 3 || requestInFlight.current) return;
    requestInFlight.current = true;
    setActing(true);
    setError(null);
    try {
      await applyFalsePositiveAction(selected, action, note.trim());
      setSelected(null);
      setAction(null);
      setNote("");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No pudimos registrar la decision.");
    } finally {
      requestInFlight.current = false;
      setActing(false);
    }
  }

  const summary = useMemo(() => ({ cases: cases.length, signals: cases.reduce((total, item) => total + item.report_count, 0) }), [cases]);

  return <main className="workspace">
    <section className="workspace-heading">
      <div><p className="eyebrow">Calidad del filtro</p><h1>Falsos positivos bajo revision humana</h1><p>Solo se agrupan metadatos tecnicos. Ninguna accion modifica filtros de dispositivos automaticamente.</p></div>
      <button className="icon-button" onClick={() => void load()} title="Actualizar senales"><RefreshCw size={18} /></button>
    </section>
    <section className="metrics" aria-label="Resumen de falsos positivos">
      <Metric icon={<FileWarning />} label="Casos en esta vista" value={summary.cases} />
      <Metric icon={<SearchCheck />} label="Senales agrupadas" value={summary.signals} />
      <Metric icon={<ShieldAlert />} label="Cambio automatico" value="Nunca" />
    </section>
    <nav className="status-tabs false-positive-tabs" aria-label="Estado de falsos positivos">
      {(["pending", "in_review", "needs_evidence", "confirmed_false_positive", "kept_blocked"] as FalsePositiveReviewStatus[]).map((item) => (
        <button aria-current={status === item ? "page" : undefined} className={status === item ? "active" : ""} key={item} onClick={() => setStatus(item)}>{falsePositiveStatusLabel(item)}</button>
      ))}
    </nav>
    <p className="review-principle">Esta cola no muestra texto, URLs, capturas, historial ni identidad de quien reporta.</p>
    {error ? <div className="error-banner" role="alert"><AlertTriangle size={18} />{error}</div> : null}
    {loading ? <CenteredState compact title="Cargando senales" body="Agrupando reportes tecnicos sin datos personales." /> : cases.length === 0 ? <EmptyFalsePositiveQueue /> : <section className="case-list">{cases.map((item) => <FalsePositiveCaseRow key={item.id} reviewCase={item} onAction={(nextAction) => { setSelected(item); setAction(nextAction); setNote(""); }} role={role} />)}</section>}
    {selected && action ? <FalsePositiveActionDialog action={action} acting={acting} note={note} onCancel={() => { setSelected(null); setAction(null); }} onConfirm={() => void confirmAction()} onNoteChange={setNote} reviewCase={selected} /> : null}
  </main>;
}

function FalsePositiveCaseRow({ reviewCase, onAction, role }: { reviewCase: FalsePositiveReviewCase; onAction: (action: FalsePositiveReviewAction) => void; role: ModeratorRole }) {
  const canResolve = role === "admin" && !["confirmed_false_positive", "kept_blocked"].includes(reviewCase.status);
  return <article className="case-row false-positive-case">
    <div className="case-meta"><span className="reason reason-other">Filtro local</span><span>{reviewCase.report_count} {reviewCase.report_count === 1 ? "senal" : "senales"}</span><span>{formatDate(reviewCase.last_reported_at)}</span></div>
    <div className="false-positive-grid">
      <div><p className="target-type">Aplicacion detectada</p><h2>{friendlyPackage(reviewCase.app_package)}</h2><p className="technical-copy">Paquete: <code>{reviewCase.app_package}</code></p></div>
      <div><p className="target-type">Regla candidata</p><h2>{shortFingerprint(reviewCase.rule_fingerprint)}</h2><p className="technical-copy">Idioma: <code>{reviewCase.locale}</code> · v{reviewCase.version}</p></div>
    </div>
    <div className="review-status"><strong>{falsePositiveStatusLabel(reviewCase.status)}</strong><span>{reviewCase.review_note || "Aun no hay nota de revision."}</span></div>
    <div className="case-actions">
      {reviewCase.status === "pending" ? <button onClick={() => onAction("claim")}><UserCheck size={17} />Reclamar</button> : null}
      {!["confirmed_false_positive", "kept_blocked"].includes(reviewCase.status) ? <button onClick={() => onAction("needs_evidence")}><SearchCheck size={17} />Pedir evidencia</button> : null}
      {canResolve ? <button onClick={() => onAction("confirm_false_positive")}><CheckCircle2 size={17} />Confirmar falso positivo</button> : null}
      {canResolve ? <button className="danger" onClick={() => onAction("keep_blocked")}><ShieldAlert size={17} />Mantener bloqueo</button> : null}
    </div>
  </article>;
}

function FalsePositiveActionDialog({ action, acting, note, onCancel, onConfirm, onNoteChange, reviewCase }: {
  action: FalsePositiveReviewAction; acting: boolean; note: string; onCancel: () => void; onConfirm: () => void; onNoteChange: (value: string) => void; reviewCase: FalsePositiveReviewCase;
}) {
  return <div className="dialog-backdrop" role="presentation"><section aria-modal="true" className="dialog" role="dialog"><p className="eyebrow">Revision humana</p><h2>{falsePositiveActionLabel(action)}</h2><p>Estas actuando sobre <strong>{friendlyPackage(reviewCase.app_package)}</strong> y la regla <code>{shortFingerprint(reviewCase.rule_fingerprint)}</code>. Esta decision queda auditada y no modifica automaticamente el filtro de ningun dispositivo.</p><label>Motivo de la decision<textarea autoFocus maxLength={500} onChange={(event) => onNoteChange(event.target.value)} placeholder="Resume evidencia, contexto y siguiente paso..." rows={5} value={note} /></label><div className="dialog-actions"><button className="secondary-button" disabled={acting} onClick={onCancel}>Cancelar</button><button className={action === "keep_blocked" ? "danger-button" : "primary-button"} disabled={acting || note.trim().length < 3} onClick={onConfirm}>{acting ? "Guardando..." : "Registrar decision"}</button></div></section></div>;
}

function CaseRow({ moderationCase, onAction, role }: { moderationCase: ModerationCase; onAction: (action: ModerationAction) => void; role: ModeratorRole }) {
  return (
    <article className="case-row">
      <div className="case-meta"><span className={`reason reason-${moderationCase.reason_snapshot}`}>{reasonLabel(moderationCase.reason_snapshot)}</span><span>{moderationCase.report_count} {moderationCase.report_count === 1 ? "reporte" : "reportes"}</span><span>{formatDate(moderationCase.created_at)}</span></div>
      <div className="case-content"><div><p className="target-type">{moderationCase.target_type === "post" ? "Publicacion" : "Comentario"}</p><h2>{moderationCase.title_snapshot || "Contenido reportado"}</h2><p>{moderationCase.content_snapshot}</p></div><span className="version">v{moderationCase.version}</span></div>
      <div className="case-actions">
        {moderationCase.status === "pending" ? <button onClick={() => onAction("claim")}><UserCheck size={17} />Reclamar</button> : null}
        {moderationCase.status === "pending" || moderationCase.status === "in_review" ? <button className="danger" onClick={() => onAction("hide_content")}><EyeOff size={17} />Ocultar</button> : null}
        {moderationCase.status === "pending" || moderationCase.status === "in_review" ? <button onClick={() => onAction("resolve_no_action")}><CheckCircle2 size={17} />Sin infraccion</button> : null}
        {role === "admin" && moderationCase.status === "resolved" ? <button onClick={() => onAction("restore_content")}><RefreshCw size={17} />Restaurar</button> : null}
      </div>
    </article>
  );
}

function ActionDialog({ action, acting, moderationCase, note, onCancel, onConfirm, onNoteChange }: {
  action: ModerationAction; acting: boolean; moderationCase: ModerationCase; note: string; onCancel: () => void; onConfirm: () => void; onNoteChange: (value: string) => void;
}) {
  return <div className="dialog-backdrop" role="presentation"><section aria-modal="true" className="dialog" role="dialog"><p className="eyebrow">Decision versionada</p><h2>{actionLabel(action)}</h2><p>Estás actuando sobre “{moderationCase.title_snapshot || "contenido reportado"}”. La nota quedará en la auditoría y no podrá editarse.</p><label>Nota operativa<textarea autoFocus maxLength={500} onChange={(event) => onNoteChange(event.target.value)} placeholder="Explica brevemente la evidencia y la decisión..." rows={5} value={note} /></label><div className="dialog-actions"><button className="secondary-button" disabled={acting} onClick={onCancel}>Cancelar</button><button className={action === "hide_content" ? "danger-button" : "primary-button"} disabled={acting || note.trim().length < 3} onClick={onConfirm}>{acting ? "Aplicando..." : "Confirmar decision"}</button></div></section></div>;
}

function Brand() { return <div className="brand"><div className="brand-mark">C<span>†</span></div><div><strong>Clean4Jesus</strong><span>Moderacion</span></div></div>; }
function SignOutButton({ compact = false }: { compact?: boolean }) { return <button className={compact ? "signout compact" : "signout"} onClick={() => void supabase.auth.signOut()}><LogOut size={16} />Cerrar sesion</button>; }
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) { return <div className="metric"><span>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></div>; }
function EmptyQueue() { return <section className="empty-queue"><CheckCircle2 /><h2>No hay casos en esta vista</h2><p>La cola está al día. Cambia de estado para revisar el historial.</p></section>; }
function EmptyFalsePositiveQueue() { return <section className="empty-queue"><SearchCheck /><h2>No hay senales en esta vista</h2><p>La revision humana esta al dia. Ninguna regla cambia sin una decision documentada.</p></section>; }
function CenteredState({ action, body, compact = false, title }: { action?: React.ReactNode; body: string; compact?: boolean; title: string }) { return <main className={compact ? "centered-state compact" : "centered-state"}><ShieldCheck /><h1>{title}</h1><p>{body}</p>{action}</main>; }
function statusLabel(status: CaseStatus) { return ({ dismissed: "Sin infraccion", in_review: "En revision", pending: "Pendientes", resolved: "Ocultos" })[status]; }
function falsePositiveStatusLabel(status: FalsePositiveReviewStatus) { return ({ confirmed_false_positive: "Confirmados", in_review: "En revision", kept_blocked: "Bloqueo correcto", needs_evidence: "Con evidencia", pending: "Pendientes" })[status]; }
function reasonLabel(reason: string) { return ({ harassment: "Acoso", other: "Otro", self_harm: "Riesgo personal", sexual_content: "Contenido sexual", spam: "Spam" } as Record<string, string>)[reason] ?? "Otro"; }
function actionLabel(action: ModerationAction) { return ({ claim: "Reclamar caso", hide_content: "Ocultar contenido", resolve_no_action: "Cerrar sin infraccion", restore_content: "Restaurar contenido" })[action]; }
function falsePositiveActionLabel(action: FalsePositiveReviewAction) { return ({ claim: "Reclamar caso", confirm_false_positive: "Confirmar falso positivo", keep_blocked: "Mantener bloqueo", needs_evidence: "Solicitar evidencia" })[action]; }
function friendlyPackage(value: string) { return ({ "com.android.chrome": "Google Chrome", "com.google.android.youtube": "YouTube", "com.instagram.android": "Instagram", "com.reddit.frontpage": "Reddit", "com.twitter.android": "X", "org.telegram.messenger": "Telegram" } as Record<string, string>)[value] ?? value; }
function shortFingerprint(value: string) { return `${value.slice(0, 12)}...${value.slice(-6)}`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
