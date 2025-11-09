import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TutorialProvider } from './contexts/TutorialContext';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import Onboarding from "./pages/Onboarding";
import HomePage from './pages/HomePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ChatPage from './pages/ChatPage';
import CalendarPage from './pages/CalendarPage';
import SupportPage from './pages/SupportPage';
import LetterPage from './pages/LetterPage';
import DiaryDetailPage from './pages/DiaryDetailPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <TutorialProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/onboarding/flow" element={<Onboarding />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/diary/:date" element={<DiaryDetailPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/letter" element={<LetterPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        </Routes>
      </Router>
    </TutorialProvider>
  );
}

export default App;