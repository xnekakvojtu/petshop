// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: 'fab fa-facebook-f', url: 'https://www.facebook.com/profile.php?id=100024656091863', label: 'Facebook' },
    { icon: 'fab fa-instagram', url: 'https://www.instagram.com/pablogomesss__/', label: 'Instagram' },
    { icon: 'fab fa-linkedin-in', url: 'https://www.linkedin.com/in/pablo-gomes-8b574321a/', label: 'LinkedIn' },
    { icon: 'fab fa-github', url: 'https://github.com/PabloG-7', label: 'GitHub' }
  ];

  const quickLinks = [
    { label: 'Início', path: '/' },
    { label: 'Produtos', path: '/#produtos' },
    { label: 'Serviços', path: '/#servicos' },
    { label: 'Planos', path: '/#planos' }
  ];

  const supportLinks = [
    { label: 'FAQ', path: '/faq' },
    { label: 'Política de Privacidade', path: '/privacidade' },
    { label: 'Termos de Uso', path: '/termos' },
    { label: 'Central de Ajuda', path: '/ajuda' }
  ];

  return (
    <footer className="footer">
      {/* Newsletter */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <i className="fas fa-envelope"></i>
              <div>
                <h3>Fique por dentro das novidades!</h3>
                <p>Receba ofertas exclusivas e dicas para seu pet</p>
              </div>
            </div>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Seu melhor e-mail" 
                aria-label="Inscrever-se na newsletter"
              />
              <button type="submit" aria-label="Assinar newsletter">
                <i className="fas fa-paper-plane"></i>
                Assinar
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <i className="fas fa-paw"></i>
                <span>LuckPet</span>
              </Link>
              <p className="footer-description">
                Oferecemos os melhores produtos e serviços para garantir o bem-estar do seu companheiro.
              </p>
              
              <div className="footer-social">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label={social.label}
                  >
                    <i className={social.icon}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="footer-title">Links Rápidos</h4>
              <ul className="footer-links">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path} className="footer-link">
                      <i className="fas fa-chevron-right"></i>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="footer-section">
              <h4 className="footer-title">Suporte</h4>
              <ul className="footer-links">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path} className="footer-link">
                      <i className="fas fa-chevron-right"></i>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-section">
              <h4 className="footer-title">Contato</h4>
              <ul className="footer-contact">
                <li className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <span className="contact-label">Endereço</span>
                    <span className="contact-info">Rua dos Animais, 123 - São Paulo</span>
                  </div>
                </li>
                <li className="contact-item">
                  <i className="fas fa-phone"></i>
                  <div>
                    <span className="contact-label">Telefone</span>
                    <span className="contact-info">(11) 99999-9999</span>
                  </div>
                </li>
                <li className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <span className="contact-label">E-mail</span>
                    <span className="contact-info">contato@luckpet.com</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; {currentYear} <strong>LuckPet</strong> - Todos os direitos reservados.
            </p>
            <div className="payment-methods">
              <i className="fab fa-cc-visa" title="Visa"></i>
              <i className="fab fa-cc-mastercard" title="Mastercard"></i>
              <i className="fab fa-cc-paypal" title="PayPal"></i>
              <i className="fas fa-qrcode" title="PIX"></i>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Variáveis */
        :root {
          --primary: #8B5CF6;
          --primary-dark: #7C3AED;
          --secondary: #10B981;
          --accent: #F59E0B;
          --dark: #1F2937;
          --gray-100: #F9FAFB;
          --gray-200: #F3F4F6;
          --gray-300: #E5E7EB;
          --gray-600: #4B5563;
          --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
          --radius-sm: 0.5rem;
          --radius-md: 0.75rem;
        }

        /* Footer Base */
        .footer {
          background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
          color: #9CA3AF;
          margin-top: auto;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Newsletter */
        .footer-newsletter {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          padding: 2.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .newsletter-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .newsletter-text {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: white;
        }

        .newsletter-text i {
          font-size: 2rem;
          opacity: 0.9;
        }

        .newsletter-text h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .newsletter-text p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.875rem;
        }

        .newsletter-form {
          display: flex;
          gap: 0.5rem;
          min-width: 300px;
        }

        .newsletter-form input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          color: var(--dark);
          background: white;
          min-width: 0;
        }

        .newsletter-form input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
        }

        .newsletter-form button {
          background: var(--dark);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .newsletter-form button:hover {
          background: #374151;
          transform: translateY(-1px);
        }

        /* Main Footer */
        .footer-main {
          padding: 3rem 0;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 3rem;
        }

        /* Brand Section */
        .footer-brand {
          max-width: 280px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .footer-logo i {
          color: var(--primary);
        }

        .footer-description {
          margin: 0 0 1.5rem 0;
          line-height: 1.5;
          font-size: 0.875rem;
        }

        .footer-social {
          display: flex;
          gap: 0.75rem;
        }

        .social-link {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: all 0.2s;
        }

        .social-link:hover {
          background: var(--primary);
          transform: translateY(-2px);
        }

        /* Footer Sections */
        .footer-section {
          margin-bottom: 1rem;
        }

        .footer-title {
          color: white;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          position: relative;
          padding-bottom: 0.5rem;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 30px;
          height: 2px;
          background: var(--primary);
        }

        .footer-links {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .footer-links li {
          margin-bottom: 0.75rem;
        }

        .footer-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #9CA3AF;
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .footer-link:hover {
          color: white;
          transform: translateX(4px);
        }

        .footer-link i {
          font-size: 0.625rem;
          color: var(--primary);
        }

        /* Contact */
        .footer-contact {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .contact-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.25rem;
          align-items: flex-start;
        }

        .contact-item i {
          color: var(--primary);
          margin-top: 0.25rem;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .contact-label {
          display: block;
          font-size: 0.75rem;
          color: #6B7280;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .contact-info {
          display: block;
          color: white;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        /* Bottom Footer */
        .footer-bottom {
          background: rgba(0, 0, 0, 0.3);
          padding: 1.5rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .copyright {
          margin: 0;
          font-size: 0.875rem;
        }

        .copyright strong {
          color: var(--primary);
          font-weight: 600;
        }

        .payment-methods {
          display: flex;
          gap: 1rem;
          font-size: 1.5rem;
        }

        .payment-methods i {
          color: rgba(255, 255, 255, 0.6);
          transition: color 0.2s;
        }

        .payment-methods i:hover {
          color: white;
        }

        /* Responsividade */
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }

          .newsletter-content {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .newsletter-form {
            width: 100%;
            max-width: 400px;
          }
        }

        @media (max-width: 768px) {
          .footer-main {
            padding: 2rem 0;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-brand {
            max-width: 100%;
            text-align: center;
          }

          .footer-social {
            justify-content: center;
          }

          .footer-section {
            text-align: center;
          }

          .footer-title::after {
            left: 50%;
            transform: translateX(-50%);
          }

          .footer-link {
            justify-content: center;
          }

          .contact-item {
            justify-content: center;
            text-align: center;
          }

          .footer-bottom-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .footer-newsletter {
            padding: 2rem 0;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .newsletter-form input,
          .newsletter-form button {
            width: 100%;
          }

          .payment-methods {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        /* Animações */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .footer-link,
        .social-link,
        .contact-item {
          animation: slideUp 0.3s ease-out;
        }

        .footer-link:nth-child(1) { animation-delay: 0.1s; }
        .footer-link:nth-child(2) { animation-delay: 0.2s; }
        .footer-link:nth-child(3) { animation-delay: 0.3s; }
        .footer-link:nth-child(4) { animation-delay: 0.4s; }

        /* Acessibilidade */
        .footer-link:focus,
        .social-link:focus,
        .newsletter-form button:focus {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }

        /* Dark mode (já é dark, mas mantendo consistência) */
        @media (prefers-color-scheme: light) {
          .footer {
            background: linear-gradient(135deg, var(--dark) 0%, #1F2937 100%);
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;