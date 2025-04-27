import React, { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { useApiKeyContext } from '../../contexts/ApiKeyContext';
import ApiCostService from '../../services/ApiCostService';

const ApiCostDisplay: React.FC = () => {
  const { apiKey } = useApiKeyContext();
  const [cost, setCost] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!apiKey) return;

    const costService = ApiCostService.getInstance();
    setHasError(costService.hasError());
    
    const updateCost = async () => {
      setIsLoading(true);
      const amount = await costService.getMonthCost(apiKey);
      setCost(amount);
      setIsLoading(false);
      setHasError(costService.hasError());
    };

    updateCost();
    const unsubscribe = costService.subscribe(updateCost);
    
    return () => unsubscribe();
  }, [apiKey]);

  if (!apiKey || isLoading) return null;

  if (hasError) {
    return (
      <div className="flex items-center gap-1 text-sm text-gray-400">
        <DollarSign className="h-4 w-4" />
        <span>N/A</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <DollarSign className="h-4 w-4" />
      <span>{cost.toFixed(2)}</span>
    </div>
  );
}

export default ApiCostDisplay;