import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import client, { setToken } from "@/api/client";
import "@/pages/auth/_Login.scss";

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const { data } = await client.post<LoginResponse>("/auth/login", {
        username: username.trim(),
        password,
      });

      if (data.data?.token) {
        setToken(data.data.token);
        navigate("/", { replace: true });
      } else {
        setError(data.message || "Error al iniciar sesión");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Error de conexión. Intenta de nuevo.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <img
          src="/logo.png"
          alt="Coralie"
          className="auth-page__logo"
        />

        <h1 className="auth-page__title">Iniciar sesión</h1>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          {error && <p className="auth-page__error">{error}</p>}

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

          <button
            className="auth-page__submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-page__footer">
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className="auth-page__link">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
