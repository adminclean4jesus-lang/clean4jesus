import { useEffect, useRef } from "react";

type Props = {
  onError: () => void;
  onToken: (token: string) => void;
};

const challengeOrigin = "https://verify.clean4jesus.com";

export function TurnstileChallenge({ onError, onToken }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();

  useEffect(() => {
    function receiveMessage(event: MessageEvent) {
      if (event.origin !== challengeOrigin || event.source !== frameRef.current?.contentWindow) return;
      if (typeof event.data !== "string") return;

      try {
        const payload = JSON.parse(event.data) as { token?: string; type?: string };
        if (payload.type === "token" && payload.token) onToken(payload.token);
        if (payload.type === "error" || payload.type === "expired") onError();
      } catch {
        onError();
      }
    }

    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, [onError, onToken]);

  if (!siteKey) {
    return <p className="form-error">Falta la configuracion segura del desafio anti-bots.</p>;
  }

  const source = `${challengeOrigin}/turnstile/?sitekey=${encodeURIComponent(siteKey)}&action=moderation_console&parentOrigin=${encodeURIComponent(window.location.origin)}`;
  return (
    <div className="captcha-challenge">
      <iframe ref={frameRef} src={source} title="Verificacion de seguridad" />
      <p>Confirma que eres una persona para continuar.</p>
    </div>
  );
}
