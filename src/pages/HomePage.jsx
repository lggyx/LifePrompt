/**
 * HomePage - Redirects to mindmap by default
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/mindmap', { replace: true });
  }, [navigate]);

  return null;
}

export default HomePage;
