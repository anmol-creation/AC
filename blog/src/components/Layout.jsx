import React from 'react';
import { NavLink } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }) {
  const [isDark, setIsDark] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showAdmin, setShowAdmin] = React.useState(false);

  React.useEffect(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    // Check admin visibility
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const envOverride = import.meta.env.REACT_APP_SHOW_ADMIN === 'true';
    setShowAdmin(isLocal || envOverride);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' }, // Placeholder
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <NavLink to="/" className="text-2xl font-bold tracking-tight text-brand-600 dark:text-brand-400">
            Blog.
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  clsx(
                    'text-sm font-medium transition-colors hover:text-brand-500',
                    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-300'
                  )
                }
              >
                {link.name}
              </NavLink>
            ))}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {showAdmin && (
              <a href="/admin" className="text-xs font-mono text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                Admin
              </a>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-medium text-gray-700 dark:text-gray-200"
                >
                  {link.name}
                </NavLink>
              ))}
               {showAdmin && <a href="/admin" className="text-sm font-mono text-gray-400">Admin</a>}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow max-w-[1150px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Blog Theme. Built with React & Tailwind.</p>
      </footer>
    </div>
  );
}
