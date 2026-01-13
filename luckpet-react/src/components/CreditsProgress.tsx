// src/components/CreditsProgress.tsx
import React from 'react';

interface CreditsProgressProps {
  currentCredits: number;
}

const CreditsProgress: React.FC<CreditsProgressProps> = ({ currentCredits }) => {
  const getLevelInfo = (credits: number) => {
    if (credits < 100) {
      return {
        level: 1,
        next: 100,
        progress: (credits / 100) * 100,
        label: `Nível 1: ${credits} LuckCoins`,
        nextLabel: 'Nível 2: 100 LuckCoins'
      };
    } else if (credits < 250) {
      return {
        level: 2,
        next: 250,
        progress: ((credits - 100) / 150) * 100,
        label: `Nível 2: ${credits} LuckCoins`,
        nextLabel: 'Nível 3: 250 LuckCoins'
      };
    } else {
      return {
        level: 3,
        next: 500,
        progress: ((credits - 250) / 250) * 100,
        label: `Nível 3: ${credits} LuckCoins`,
        nextLabel: 'Nível 4: 500 LuckCoins'
      };
    }
  };

  const levelInfo = getLevelInfo(currentCredits);

  return (
    <div className="credits-progress">
      <h4>Continue acumulando LuckCoins!</h4>
      <p>Seu progresso atual:</p>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${levelInfo.progress}%` }}
        ></div>
      </div>
      <div className="progress-text">
        <span id="current-level">{levelInfo.label}</span>
        <span id="next-level">{levelInfo.nextLabel}</span>
      </div>
      
      <div className="ways-to-earn">
        <h4>Como ganhar mais LuckCoins:</h4>
        <ul>
          <li><strong>+5 coins</strong> para cada R$ 50,00 em compras</li>
          <li><strong>+10 coins</strong> ao avaliar produtos comprados</li>
          <li><strong>+20 coins</strong> no seu aniversário</li>
          <li><strong>+15 coins</strong> ao indicar amigos para a LuckPet</li>
        </ul>
      </div>
    </div>
  );
};

export default CreditsProgress;