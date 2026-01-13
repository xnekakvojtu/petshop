// src/pages/Login.tsx - COMPLETO E CORRIGIDO
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: 'cachorro'
  });

  // Verificar se já está logado
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/');
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        if (!formData.email || !formData.password) {
          throw new Error('Preencha todos os campos');
        }

        console.log('Tentando login com:', formData.email);
        
        // Usar auth do Firebase
        const user = await loginWithEmail(formData.email, formData.password);
        console.log('Login bem sucedido:', user);
        
        setSuccess('Login realizado com sucesso!');
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 1500);

      } else {
        // REGISTRO
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error('Preencha todos os campos obrigatórios');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem');
        }

        if (formData.password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        console.log('Tentando registro com:', formData);
        
        // Usar registro do Firebase
        const user = await registerWithEmail(
          formData.email,
          formData.password,
          formData.name,
          formData.avatar
        );
        
        console.log('Registro bem sucedido:', user);
        
        setSuccess('Conta criada com sucesso! Verifique seu email.');
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Erro no login/registro:', err);
      
      // Mensagens amigáveis para erros comuns
      if (err.code === 'auth/invalid-email') {
        setError('Email inválido');
      } else if (err.code === 'auth/user-not-found') {
        setError('Usuário não encontrado');
      } else if (err.code === 'auth/wrong-password') {
        setError('Senha incorreta');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha é muito fraca');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Erro de conexão. Verifique sua internet');
      } else {
        setError(err.message || 'Erro ao processar sua solicitação');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Tentando login com Google...');
      const user = await loginWithGoogle();
      console.log('Login Google bem sucedido:', user);
      
      setSuccess('Login com Google realizado!');
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1500);
      
    } catch (err: any) {
      console.error('Erro no login Google:', err);
      setError('Erro ao fazer login com Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setLoading(true);
    
    // Criar usuário convidado local
    const guestUser = {
      id: `guest_${Date.now()}`,
      name: 'Convidado',
      email: 'convidado@luckpet.com',
      credits: 50,
      isGuest: true,
      avatar: 'cachorro'
    };
    
    login(guestUser);
    localStorage.setItem('isGuest', 'true');
    
    setSuccess('Entrando como convidado...');
    setTimeout(() => {
      navigate('/');
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-header">
          <Link to="/" className="logo">
            <i className="fas fa-paw"></i>
            <span>LuckPet</span>
          </Link>
          <h1>{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}</h1>
          <p className="subtitle">
            {isLogin 
              ? 'Entre para acessar seus agendamentos e serviços' 
              : 'Cadastre-se para começar a usar todos os serviços'}
          </p>
        </div>

        {/* Erros e Sucessos */}
        {error && (
          <div className="alert error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="alert success">
            <i className="fas fa-check-circle"></i>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">
                <i className="fas fa-user"></i> Seu Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Digite seu nome completo"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@email.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i> Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={isLogin ? "Digite sua senha" : "Crie uma senha forte"}
              disabled={loading}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <i className="fas fa-lock"></i> Confirmar Senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Digite a senha novamente"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="avatar">
                  <i className="fas fa-paw"></i> Escolha seu Avatar
                </label>
                <select
                  id="avatar"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="avatar-select"
                >
                  <option value="cachorro">🐶 Cachorro</option>
                  <option value="gato">🐱 Gato</option>
                  <option value="coelho">🐰 Coelho</option>
                  <option value="passaro">🐦 Pássaro</option>
                </select>
              </div>
            </>
          )}

          {isLogin && (
            <div className="form-options">
              <label className="checkbox">
                <input type="checkbox" />
                <span>Lembrar de mim</span>
              </label>
              <a href="#" className="forgot-password">
                Esqueceu a senha?
              </a>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                {isLogin ? 'Entrando...' : 'Criando conta...'}
              </>
            ) : (
              isLogin ? 'Entrar' : 'Criar Conta'
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="divider">
          <span>ou</span>
        </div>

        {/* Botões sociais */}
        <div className="social-buttons">
          <button 
            type="button" 
            className="btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <i className="fab fa-google"></i>
            Continuar com Google
          </button>

          <button 
            type="button" 
            className="btn-guest"
            onClick={handleGuestLogin}
            disabled={loading}
          >
            <i className="fas fa-user-clock"></i>
            Entrar como Convidado
          </button>
        </div>

        {/* Alternar entre Login e Registro */}
        <div className="toggle-form">
          <p>
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button 
              type="button" 
              className="toggle-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              disabled={loading}
            >
              {isLogin ? ' Cadastre-se' : ' Faça login'}
            </button>
          </p>
        </div>

        {/* Voltar para home */}
        <div className="back-home">
          <Link to="/" className="back-link">
            <i className="fas fa-arrow-left"></i>
            Voltar para a página inicial
          </Link>
        </div>
      </div>

      <style >{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 500px;
          padding: 40px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #8B5CF6;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .logo i {
          font-size: 28px;
        }

        .login-header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          color: #1f2937;
        }

        .subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 15px;
        }

        .alert {
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert.error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .alert.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 25px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
          color: #4b5563;
          font-size: 14px;
        }

        .form-group label i {
          color: #8B5CF6;
          width: 16px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.2s;
          background: white;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #8B5CF6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .form-group input:disabled,
        .form-group select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .avatar-select {
          cursor: pointer;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #6b7280;
        }

        .checkbox input {
          margin: 0;
        }

        .forgot-password {
          color: #8B5CF6;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .btn-primary {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
          margin-top: 10px;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 30px 0;
          color: #9ca3af;
          font-size: 14px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .divider span {
          padding: 0 15px;
        }

        .social-buttons {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 25px;
        }

        .btn-google,
        .btn-guest {
          padding: 15px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.2s;
          border: 2px solid #e5e7eb;
          background: white;
          color: #4b5563;
        }

        .btn-google:hover:not(:disabled),
        .btn-guest:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-2px);
        }

        .btn-google:disabled,
        .btn-guest:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-google i {
          color: #DB4437;
          font-size: 18px;
        }

        .btn-guest i {
          color: #8B5CF6;
          font-size: 16px;
        }

        .toggle-form {
          text-align: center;
          margin-bottom: 25px;
          color: #6b7280;
          font-size: 15px;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: #8B5CF6;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-size: 15px;
        }

        .toggle-btn:hover:not(:disabled) {
          text-decoration: underline;
        }

        .toggle-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .back-home {
          text-align: center;
          padding-top: 25px;
          border-top: 1px solid #e5e7eb;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #8B5CF6;
        }

        @media (max-width: 768px) {
          .login-container {
            padding: 30px;
            max-width: 90%;
          }

          .login-header h1 {
            font-size: 24px;
          }

          .form-options {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 25px 20px;
          }

          .login-header h1 {
            font-size: 22px;
          }

          .subtitle {
            font-size: 14px;
          }

          .form-group input,
          .form-group select {
            padding: 12px 14px;
            font-size: 14px;
          }

          .btn-primary,
          .btn-google,
          .btn-guest {
            padding: 14px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;