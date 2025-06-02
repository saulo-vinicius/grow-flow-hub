
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BG</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {t('app.name')}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('app.tagline')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="/" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">{t('nav.dashboard')}</a></li>
              <li><a href="/calculator" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">{t('nav.calculator')}</a></li>
              <li><a href="/recipes" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">{t('nav.recipes')}</a></li>
              <li><a href="/plants" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">{t('nav.plants')}</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Suporte
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Ajuda</a></li>
              <li><a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Termos</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 {t('app.name')}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
