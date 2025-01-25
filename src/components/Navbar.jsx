import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../App';
import { Sun, Moon } from 'lucide-react';

function Navbar() {
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              FootballChamps
            </Link>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;