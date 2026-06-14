import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import client, { setToken } from "@/api/client";
import AuthCard from "@/components/auth/AuthCard";
import "@/pages/auth/styles/Signup.scss";

type SignupResponse = {
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

type FormErrors = {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
};

function validate(
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
): FormErrors {
  const errors: FormErrors = {};

  if (!username.trim()) {
    errors.username = "El usuario es obligatorio";
  } else if (username.trim().length < 3) {
    errors.username = "El usuario debe tener al menos 3 caracteres";
  }

  if (!email.trim()) {
    errors.email = "El correo es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Ingresa un correo válido";
  }

  if (!password) {
    errors.password = "La contraseña es obligatoria";
  } else if (password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirma tu contraseña";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  return errors;
}

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validation = validate(username, email, password, confirmPassword);
    setErrors(validation);

    if (Object.keys(validation).length > 0) return;

    setLoading(true);

    try {
      const { data } = await client.post<SignupResponse>("/auth/signup", {
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        password,
      });

      if (data.data?.token) {
        setToken(data.data.token);
        navigate("/", { replace: true });
      } else {
        setApiError(data.message || "Error al registrarse");
      }
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        "Algo salió mal";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (field: keyof FormErrors) =>
    `auth-page__input${errors[field] ? " auth-page__input--error" : ""}`;

  return (
    <AuthCard
      title="Crear cuenta"
      error={apiError}
      loading={loading}
      submitLabel="Crear cuenta"
      loadingLabel="Creando cuenta..."
      footerText="¿Ya tienes cuenta?"
      footerLink={<Link to="/login" className="auth-page__link">Inicia sesión</Link>}
      onSubmit={handleSubmit}
    >
      <label className="auth-page__field">
        <span className="auth-page__label">Usuario</span>
        <input
          className={fieldClass("username")}
          type="text"
          placeholder="Tu nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          disabled={loading}
        />
        {errors.username && (
          <span className="auth-page__field-error">{errors.username}</span>
        )}
      </label>

      <label className="auth-page__field">
        <span className="auth-page__label">Correo electrónico</span>
        <input
          className={fieldClass("email")}
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />
        {errors.email && (
          <span className="auth-page__field-error">{errors.email}</span>
        )}
      </label>

      <label className="auth-page__field">
        <span className="auth-page__label">
          Teléfono <span className="auth-page__optional">(opcional)</span>
        </span>
        <input
          className="auth-page__input"
          type="tel"
          placeholder="22334455"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          disabled={loading}
        />
      </label>

      <label className="auth-page__field">
        <span className="auth-page__label">Contraseña</span>
        <input
          className={fieldClass("password")}
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          disabled={loading}
        />
        {errors.password && (
          <span className="auth-page__field-error">{errors.password}</span>
        )}
      </label>

      <label className="auth-page__field">
        <span className="auth-page__label">Confirmar contraseña</span>
        <input
          className={fieldClass("confirmPassword")}
          type="password"
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          disabled={loading}
        />
        {errors.confirmPassword && (
          <span className="auth-page__field-error">
            {errors.confirmPassword}
          </span>
        )}
      </label>
    </AuthCard>
  );
}

export default Signup;
