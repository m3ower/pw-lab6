import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { BooksProvider } from './context/BooksContext';
import Navbar from './components/Navbar';
import LibraryPage from './pages/LibraryPage';
import BookDetailPage from './pages/BookDetailPage';
import StatsPage from './pages/StatsPage';
import './index.css';

export default function App() {
  return (
    <ThemeProvider>
      <BooksProvider>
        <BrowserRouter basename="/pw-lab6">
          <Navbar />
          <main className="page-wrapper">
            <Routes>
              <Route path="/" element={<LibraryPage />} />
              <Route path="/book/:id" element={<BookDetailPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
          </main>
        </BrowserRouter>
      </BooksProvider>
    </ThemeProvider>
  );
}
