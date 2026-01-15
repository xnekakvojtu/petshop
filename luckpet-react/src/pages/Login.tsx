// src/pages/Login.tsx - COMPLETO E ATUALIZADO
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types';

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
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      name: 'Convidado',
      email: 'convidado@luckpet.com',
      credits: 100,
      isGuest: true,
      avatar: 'cachorro',
      role: 'user'
    };
    
    login(guestUser);
    localStorage.setItem('isGuest', 'true');
    
    setSuccess('Entrando como convidado...');
    setTimeout(() => {
      navigate('/');
      window.location.reload();
    }, 1000);
  };

  // Função para login como administrador (teste)
  const handleAdminLogin = () => {
    setLoading(true);
    
    const adminUser: User = {
      id: 'admin_123',
      name: 'Administrador',
      email: 'admin@luckpet.com',
      credits: 1000,
      isGuest: false,
      avatar: 'admin',
      role: 'admin'
    };
    
    login(adminUser);
    
    setSuccess('Entrando como Administrador...');
    setTimeout(() => {
      navigate('/admin');
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

          {/* Botão de teste para login como administrador */}
          <button 
            type="button" 
            className="btn-admin"
            onClick={handleAdminLogin}
            disabled={loading}
          >
            <i className="fas fa-crown"></i>
            Acesso Administrativo
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
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          width: 100%;
          max-width: 500px;
          padding: 50px;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 35px;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #8B5CF6;
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 25px;
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo i {
          font-size: 32px;
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-header h1 {
          margin: 0 0 12px 0;
          font-size: 30px;
          color: #1f2937;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 16px;
          line-height: 1.5;
        }

        .alert {
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          animation: slideDown 0.3s ease;
          backdrop-filter: blur(10px);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert.error {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #dc2626;
          border: 1px solid rgba(220, 38, 38, 0.2);
        }

        .alert.success {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
          border: 1px solid rgba(5, 95, 70, 0.2);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 22px;
          margin-bottom: 30px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          font-weight: 600;
          color: #374151;
          font-size: 15px;
        }

        .form-group label i {
          color: #8B5CF6;
          width: 18px;
          text-align: center;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 16px 18px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #8B5CF6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
          transform: translateY(-1px);
        }

        .form-group input:disabled,
        .form-group select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f9fafb;
        }

        .avatar-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238B5CF6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 20px;
          padding-right: 45px;
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
          gap: 10px;
          cursor: pointer;
          font-size: 15px;
          color: #4b5563;
          transition: color 0.2s;
        }

        .checkbox:hover {
          color: #374151;
        }

        .checkbox input {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid #d1d5db;
          cursor: pointer;
          transition: all 0.2s;
        }

        .checkbox input:checked {
          background-color: #8B5CF6;
          border-color: #8B5CF6;
        }

        .forgot-password {
          color: #8B5CF6;
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s;
          padding: 4px 0;
        }

        .forgot-password:hover {
          text-decoration: underline;
          transform: translateY(-1px);
        }

        .btn-primary {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          border: none;
          padding: 18px;
          border-radius: 12px;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 15px;
          letter-spacing: 0.3px;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.25);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(139, 92, 246, 0.4);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .spinner {
          width: 22px;
          height: 22px;
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
          margin: 32px 0;
          color: #9ca3af;
          font-size: 15px;
          font-weight: 500;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
        }

        .divider span {
          padding: 0 20px;
          background: white;
          z-index: 1;
        }

        .social-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 30px;
        }

        .btn-google,
        .btn-guest,
        .btn-admin {
          padding: 17px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
          letter-spacing: 0.2px;
        }

        .btn-google {
          background: white;
          color: #4b5563;
          border-color: #e5e7eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .btn-google:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .btn-guest {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          color: #475569;
          border-color: #e2e8f0;
          box-shadow: 0 4px 12px rgba(148, 163, 184, 0.1);
        }

        .btn-guest:hover:not(:disabled) {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-color: #cbd5e1;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(148, 163, 184, 0.2);
        }

        .btn-admin {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          border: none;
          margin-top: 8px;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.3);
        }

        .btn-admin:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.4);
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        }

        .btn-google:disabled,
        .btn-guest:disabled,
        .btn-admin:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-google i {
          color: #DB4437;
          font-size: 20px;
        }

        .btn-guest i {
          color: #8B5CF6;
          font-size: 18px;
        }

        .btn-admin i {
          color: #fbbf24;
          font-size: 18px;
        }

        .toggle-form {
          text-align: center;
          margin-bottom: 30px;
          color: #6b7280;
          font-size: 16px;
          padding-top: 10px;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: #8B5CF6;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          font-size: 16px;
          margin-left: 8px;
          transition: all 0.2s;
          position: relative;
        }

        .toggle-btn:hover:not(:disabled) {
          color: #7C3AED;
          transform: translateY(-1px);
        }

        .toggle-btn:hover:not(:disabled)::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #8B5CF6, #7C3AED);
          border-radius: 1px;
        }

        .toggle-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .back-home {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #f1f5f9;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #64748b;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s;
          padding: 10px 20px;
          border-radius: 10px;
        }

        .back-link:hover {
          color: #8B5CF6;
          background: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        @media (max-width: 768px) {
          .login-container {
            padding: 35px;
            max-width: 90%;
            margin: 20px;
          }

          .login-header h1 {
            font-size: 26px;
          }

          .form-options {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 28px 22px;
            border-radius: 16px;
          }

          .login-header h1 {
            font-size: 24px;
          }

          .subtitle {
            font-size: 15px;
          }

          .form-group input,
          .form-group select {
            padding: 14px 16px;
            font-size: 15px;
          }

          .btn-primary,
          .btn-google,
          .btn-guest,
          .btn-admin {
            padding: 16px;
            font-size: 15px;
          }

          .logo {
            font-size: 24px;
          }

          .logo i {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;