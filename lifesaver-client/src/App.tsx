import { Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar.tsx';
import DashboardPage from './pages/Dashboard.tsx';
import FirstAidPage from './pages/FirstAid.tsx';
import ReportPage from './pages/Report.tsx';

function App() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-10 pt-6">
        <Routes>
          <Route path="/" element={<ReportPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/first-aid" element={<FirstAidPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
