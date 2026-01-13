// src/components/SearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { products } from '../data/products';

interface SearchBarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onClose, isMobile = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const searchItems = [
    // Produtos alimentação
    ...Object.values(products)
      .filter(p => p.type === 'alimento')
      .slice(0, 3)
      .map(product => ({
        ...product,
        type: 'produto',
        category: 'Alimentos'
      })),
    // Produtos vestimenta
    ...Object.values(products)
      .filter(p => p.type === 'vestimenta')
      .slice(0, 3)
      .map(product => ({
        ...product,
        type: 'produto',
        category: 'Roupas e Acessórios'
      })),
    // Serviços
    { id: 'banho', name: 'Banho Completo', type: 'servico', category: 'Serviços' },
    { id: 'tosa', name: 'Tosa Premium', type: 'servico', category: 'Serviços' },
    { id: 'consulta', name: 'Consulta Veterinária', type: 'servico', category: 'Serviços' },
    // Planos
    { id: 'basico', name: 'Plano Básico', type: 'plano', category: 'Planos de Saúde' },
    { id: 'premium', name: 'Plano Premium', type: 'plano', category: 'Planos de Saúde' },
    // Seções
    { id: 'moda-pet', name: 'Moda Pet', type: 'secao', category: 'Seções do Site' },
    { id: 'nutricao-pet', name: 'Nutrição', type: 'secao', category: 'Seções do Site' },
    { id: 'servicos', name: 'Serviços', type: 'secao', category: 'Seções do Site' },
    { id: 'saude-pet', name: 'Saúde Pet', type: 'secao', category: 'Seções do Site' },
    { id: 'curiosidades', name: 'Curiosidades', type: 'secao', category: 'Seções do Site' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filtered = searchItems.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 6));
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const foundItem = searchItems.find(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      
      if (foundItem) {
        if (foundItem.type === 'secao') {
          const element = document.getElementById(foundItem.id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          alert(`Pesquisando por: ${foundItem.name}`);
        }
      } else {
        alert(`Nenhum resultado para: ${query}`);
      }
      setQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (item: any) => {
    setQuery('');
    setShowSuggestions(false);
    
    if (item.type === 'secao') {
      const element = document.getElementById(item.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      alert(`Selecionado: ${item.name}`);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="search-container" ref={searchContainerRef}>
      <form onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <i className="fas fa-search search-icon"></i>
          <input 
            type="text" 
            className="search-input" 
            placeholder="O que seu pet precisa hoje?" 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            autoComplete="off"
          />
          
          {query && (
            <button 
              type="button"
              className="clear-btn"
              onClick={clearSearch}
              aria-label="Limpar busca"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
          
          {isMobile && onClose && (
            <button 
              type="button"
              className="close-search-btn"
              onClick={onClose}
              aria-label="Fechar busca"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
          
          <button type="submit" className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions active">
          {suggestions.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="search-suggestion"
              onClick={() => handleSuggestionClick(item)}
            >
              <i className={`fas ${
                item.type === 'produto' ? 'fa-shopping-bag' :
                item.type === 'servico' ? 'fa-concierge-bell' :
                item.type === 'plano' ? 'fa-heartbeat' :
                'fa-folder'
              }`}></i>
              <div className="suggestion-content">
                <div className="suggestion-title">{item.name}</div>
                <small className="suggestion-category">
                  {item.category}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .search-container {
          position: relative;
          width: 100%;
          max-width: 500px;
          z-index: 1000;
        }

        @media (max-width: 768px) {
          .search-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            padding: 16px;
            max-width: 100%;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1001;
          }
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border-radius: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
          .search-input-wrapper {
            border-radius: 20px;
          }
        }

        .search-input-wrapper:focus-within {
          border-color: #8B5CF6;
          box-shadow: 0 2px 15px rgba(139, 92, 246, 0.15);
        }

        .search-icon {
          position: absolute;
          left: 15px;
          color: #9CA3AF;
          font-size: 14px;
          z-index: 1;
        }

        .search-input {
          flex: 1;
          width: 100%;
          padding: 12px 45px 12px 40px;
          border: none;
          background: transparent;
          font-size: 14px;
          color: #374151;
          outline: none;
          z-index: 2;
        }

        @media (max-width: 768px) {
          .search-input {
            padding: 14px 50px 14px 40px;
            font-size: 16px;
          }
        }

        .search-input::placeholder {
          color: #9CA3AF;
        }

        .clear-btn {
          position: absolute;
          right: 45px;
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          padding: 5px;
          font-size: 12px;
          transition: color 0.2s;
          z-index: 3;
        }

        @media (max-width: 768px) {
          .clear-btn {
            right: 60px;
            font-size: 14px;
          }
        }

        .clear-btn:hover {
          color: #6B7280;
        }

        .close-search-btn {
          position: absolute;
          right: 45px;
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          padding: 5px;
          font-size: 16px;
          transition: color 0.2s;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }

        @media (min-width: 769px) {
          .close-search-btn {
            display: none;
          }
        }

        .close-search-btn:hover {
          color: #374151;
        }

        .search-btn {
          position: absolute;
          right: 0;
          background: #8B5CF6;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 0 25px 25px 0;
          cursor: pointer;
          transition: background 0.2s;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .search-btn {
            padding: 14px 20px;
            border-radius: 0 20px 20px 0;
          }
        }

        .search-btn:hover {
          background: #7C3AED;
        }

        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          margin-top: 8px;
          z-index: 1002;
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
        }

        .search-suggestions.active {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .search-suggestions {
            position: fixed;
            top: 72px;
            left: 16px;
            right: 16px;
            max-height: calc(100vh - 100px);
            z-index: 1002;
          }
        }

        .search-suggestion {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.2s;
        }

        .search-suggestion:last-child {
          border-bottom: none;
        }

        .search-suggestion:hover {
          background: #f9fafb;
        }

        .search-suggestion i {
          color: #8B5CF6;
          margin-right: 12px;
          font-size: 14px;
          width: 16px;
          text-align: center;
        }

        .suggestion-content {
          flex: 1;
        }

        .suggestion-title {
          font-weight: 500;
          color: #374151;
          margin-bottom: 2px;
          font-size: 14px;
        }

        .suggestion-category {
          color: #6B7280;
          font-size: 12px;
        }

        .search-suggestions::-webkit-scrollbar {
          width: 6px;
        }

        .search-suggestions::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 0 12px 12px 0;
        }

        .search-suggestions::-webkit-scrollbar-thumb {
          background: #c7c7c7;
          border-radius: 3px;
        }

        @media (max-width: 480px) {
          .search-input-wrapper {
            border-radius: 15px;
          }
          
          .search-input {
            padding: 14px 45px 14px 40px;
          }
          
          .search-btn {
            padding: 14px 18px;
          }
          
          .search-suggestions {
            top: 70px;
            left: 8px;
            right: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;