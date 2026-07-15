import { useState } from 'react';
import DemandForecastPage from './pages/DemandForecastPage';
import StockoutRiskPage from './pages/StockoutRiskPage';
import SafetyStockPage from './pages/SafetyStockPage';
import AnomalyDetectorPage from './pages/AnomalyDetectorPage';
import SapPrPoPage from './pages/SapPrPoPage';

export default function App() {
  const [page, setPage] = useState('overview');

  // if (page === 'overview' || page === 'health') {
  //   return <Overview active={page} onNavigate={setPage} />;
  // }

  if (page === 'demand') {
    return <DemandForecastPage onNavigate={setPage} />;
  }

  if (page === 'stockout') {
    return <StockoutRiskPage onNavigate={setPage} />;
  }

  if (page === 'safety') {
    return <SafetyStockPage onNavigate={setPage} />;
  }

  if (page === 'anomaly') {
    return <AnomalyDetectorPage onNavigate={setPage} />;
  }

  if (page === 'sap') {
    return <SapPrPoPage onNavigate={setPage} />;
  }

  return <DemandForecastPage active="overview" onNavigate={setPage} />;
}
