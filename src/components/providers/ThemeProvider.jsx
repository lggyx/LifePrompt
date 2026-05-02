/**
 * ThemeProvider - Initializes theme on app mount
 */

import { useEffect } from 'react';
import useThemeStore from '../../stores/useThemeStore';

function ThemeProvider({ children }) {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return children;
}

export default ThemeProvider;
