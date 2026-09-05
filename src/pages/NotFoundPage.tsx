import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900">Страница не найдена</h1>
        <p className="text-gray-500 mt-2">К сожалению, такой страницы не существует или она была перемещена.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            На главную
          </Link>
          <Link to="/catalog" className="btn-secondary flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            В каталог
          </Link>
        </div>
      </div>
    </div>
  );
}