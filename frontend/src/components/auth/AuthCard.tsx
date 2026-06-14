import { useState, type FormEvent, type ReactNode } from "react";
import "@/components/auth/styles/AuthCard.scss";

type AuthCardProps = {
  title: string;
  error: string | null;
  rawError?: string;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
  footerText: string;
  footerLink: ReactNode;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
};

function AuthCard({
  title,
  error,
  rawError,
  loading,
  submitLabel,
  loadingLabel,
  footerText,
  footerLink,
  onSubmit,
  children,
}: AuthCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!rawError) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    navigator.clipboard?.writeText(rawError).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = rawError;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <img src="/logo.png" alt="Coralie" className="auth-page__logo" />

        <h1 className="auth-page__title">{title}</h1>

        <form className="auth-page__form" onSubmit={onSubmit} noValidate>
          {error && (
            <div className="auth-page__error-wrap">
              <p className="auth-page__error-title">{error}</p>
              {rawError && (
                <div className="auth-page__copy-row">
                  <button
                    type="button"
                    className="auth-page__copy"
                    onClick={handleCopy}
                  >
                    {copied ? "¡Copiado!" : "Copiar para soporte técnico"}
                  </button>
                </div>
              )}
            </div>
          )}

          {children}

          <button
            className="auth-page__submit"
            type="submit"
            disabled={loading}
          >
            {loading ? loadingLabel : submitLabel}
          </button>
        </form>

        <p className="auth-page__footer">
          {footerText} {footerLink}
        </p>
      </div>
    </div>
  );
}

export default AuthCard;
