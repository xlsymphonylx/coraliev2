import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import client, { setToken } from "@/api/client";
import AuthCard from "@/components/auth/AuthCard";

type LoginResponse = {
  status: number;
  message: string;
  data?: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      roles: { id: number; name: string }[];
    };
  };
};

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rawError, setRawError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Todos los campos son obligatorios");
      setRawError("validation: campos vacíos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await client.post<LoginResponse>("/auth/login", {
        username: username.trim(),
        password,
      });

      if (data.data?.token) {
        setToken(data.data.token);
        navigate("/", { replace: true });
      } else {
        const detail = JSON.stringify(data, null, 2);
        setError("No se pudo iniciar sesión");
        setRawError(detail);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown }; message?: string; code?: string };
      const raw = axiosErr.response?.data;
      const detail = raw ? JSON.stringify(raw, null, 2) : JSON.stringify({ message: axiosErr.message, code: axiosErr.code }, null, 2);
      setError("No se pudo iniciar sesión");
      setRawError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Iniciar sesión"
      error={error}
      rawError={rawError}
      loading={loading}
      submitLabel="Entrar"
      loadingLabel="Entrando..."
      footerText="¿No tienes cuenta?"
      footerLink={<Link to="/signup" className="auth-page__link">Regístrate</Link>}
      onSubmit={handleSubmit}
    >
      <label className="auth-page__field">
        <span className="auth-page__label">Usuario</span>
        <input
          className="auth-page__input"
          type="text"
          placeholder="Tu nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          disabled={loading}
        />
      </label>

      <label className="auth-page__field">
        <span className="auth-page__label">Contraseña</span>
        <input
          className="auth-page__input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading}
        />
      </label>
    </AuthCard>
  );
}

export default Login;
