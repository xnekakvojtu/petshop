// src/pages/BookingsPage.tsx - VERSÃO SUPER LIMPA
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookingsHistory from '../components/BookingsHistory';

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bookings-page">
      {/* APENAS Botão de voltar no topo da página */}
      <div className="simple-header">
        <button 
          className="back-only-btn"
          onClick={() => navigate('/')}
        >
          <i className="fas fa-arrow-left"></i>
          Voltar para Tela Principal
        </button>
      </div>
      
      <main className="bookings-main">
        <div className="container">
          {/* Título da página */}
          <div className="page-title">
            <h1>
              <i className="fas fa-calendar-alt"></i>
              Meus Agendamentos
            </h1>
            <p className="subtitle">Gerencie seus serviços agendados</p>
          </div>
          
          {/* Conteúdo dos agendamentos */}
          <div className="bookings-content">
            <BookingsHistory />
          </div>
        </div>
      </main>
      
      <style >{`
        .bookings-page {
          min-height: 100vh;
          background: #f8fafc;
        }

        /* Header super simples - APENAS botão voltar */
        .simple-header {
          background: white;
          border-bottom: 1px solid #eaeaea;
          padding: 15px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .back-only-btn {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 16px;
          cursor: pointer;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
          max-width: 1200px;
          margin: 0 auto;
          padding-left: 20px;
        }

        .back-only-btn:hover {
          color: #4b5563;
          background: #f9fafb;
          border-radius: 8px;
        }

        .bookings-main {
          padding: 30px 0 40px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .page-title {
          text-align: center;
          margin-bottom: 30px;
        }

        .page-title h1 {
          font-size: 28px;
          color: #1f2937;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .page-title h1 i {
          color: #8B5CF6;
          font-size: 32px;
        }

        .subtitle {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
        }

        .bookings-content {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
        }

        @media (max-width: 768px) {
          .bookings-main {
            padding: 20px 0 30px;
          }

          .page-title h1 {
            font-size: 24px;
            flex-direction: column;
            gap: 8px;
          }

          .page-title h1 i {
            font-size: 28px;
          }

          .bookings-content {
            padding: 20px;
          }

          .back-only-btn {
            font-size: 15px;
            padding-left: 15px;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 15px;
          }

          .page-title h1 {
            font-size: 20px;
          }

          .subtitle {
            font-size: 14px;
          }

          .back-only-btn {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingsPage;