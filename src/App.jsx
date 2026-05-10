import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { BooksProvider } from './context/BooksContext';
import Navbar from './components/Navbar';
import LibraryPage from './pages/LibraryPage';
import BookDetailPage from './pages/BookDetailPage';
import StatsPage from './pages/StatsPage';
import TokenPage from './pages/TokenPage';
import './index.css';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BooksProvider>
          <BrowserRouter basename="/pw-lab6">
            <Navbar />
            <main className="page-wrapper">
              <Routes>
                <Route path="/" element={<LibraryPage />} />
                <Route path="/book/:id" element={<BookDetailPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/token" element={<TokenPage />} />
              </Routes>
            </main>
          </BrowserRouter>
        </BooksProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
