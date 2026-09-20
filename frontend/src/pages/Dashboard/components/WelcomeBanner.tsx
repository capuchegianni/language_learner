import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../../components';
import { IconNewDispatch } from '../../../components/icons';
import { useLanguages } from '../../../contexts/LanguageContext';

export const WelcomeBanner: React.FC = () => {
  const navigate = useNavigate();
  const { targetLanguage } = useLanguages();

  return (
    <Card
      className="welcome-banner"
      id="tutorial-welcome-banner"
    >
      <div className="welcome-banner-content">
        <div>
          <h1 className="welcome-title">
            Ready for Today's {targetLanguage} Lesson?
          </h1>
          <p className="welcome-subtitle">
            Your personal AI tutor generates custom rules, manages your vocabulary bank, and evaluates your handwritten or typed exercise submissions in real time.
          </p>
        </div>
        <Button
          variant="primary"
          className="welcome-action-btn"
          id="tutorial-start-lesson-btn"
          onClick={() => navigate('/lessons/new')}
          icon={<IconNewDispatch size={20} />}
        >
          <span>Start Daily Lesson</span>
        </Button>
      </div>
    </Card>
  );
};
