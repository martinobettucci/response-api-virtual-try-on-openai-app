const API_COST_STORAGE_KEY = 'api-cost-cache';

interface CostCache {
  amount: number;
  timestamp: number;
  error?: string;
}

class ApiCostService {
  private static instance: ApiCostService;
  private subscribers: Set<() => void>;
  private cache: CostCache | null;
  private hasPermissionError: boolean = false;

  private constructor() {
    const stored = localStorage.getItem(API_COST_STORAGE_KEY);
    this.cache = stored ? JSON.parse(stored) : null;
    this.hasPermissionError = this.cache?.error === 'permission_denied';
    this.subscribers = new Set();
  }

  public static getInstance(): ApiCostService {
    if (!ApiCostService.instance) {
      ApiCostService.instance = new ApiCostService();
    }
    return ApiCostService.instance;
  }

  public async getMonthCost(apiKey: string): Promise<number> {
    // If we already know we don't have permissions, don't try again
    if (this.hasPermissionError) {
      return 0;
    }
    
    // Check cache first (valid for 1 hour)
    if (this.cache && Date.now() - this.cache.timestamp < 3600000) {
      return this.cache.amount;
    }

    try {
      const firstOfMonthUTC = Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(), 
        1
      ) / 1000;

      const url = new URL("https://api.openai.com/v1/organization/costs");
      url.searchParams.append("start_time", firstOfMonthUTC.toString());
      url.searchParams.append("bucket_width", "1d");
      url.searchParams.append("limit", "31");

      const res = await fetch(url.toString(), {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        // Check if it's a permissions error
        if (errorText.includes('insufficient permissions') || errorText.includes('api.usage.read')) {
          this.hasPermissionError = true;
          this.cache = { amount: 0, timestamp: Date.now(), error: 'permission_denied' };
          localStorage.setItem(API_COST_STORAGE_KEY, JSON.stringify(this.cache));
          this.notifySubscribers();
          return 0;
        }
        throw new Error(errorText);
      }

      const data = await res.json() as {
        data: { results: { amount: { value: number } }[] }[];
      };

      const amount = data.data
        .flatMap(b => b.results)
        .reduce((sum, r) => sum + r.amount.value, 0);

      // Update cache
      this.cache = { amount, timestamp: Date.now(), error: undefined };
      localStorage.setItem(API_COST_STORAGE_KEY, JSON.stringify(this.cache));
      this.notifySubscribers();

      return amount;
    } catch (error) {
      console.error('Error fetching API costs:', error);
      return this.cache?.amount ?? 0;
    }
  }

  public hasError(): boolean {
    return this.hasPermissionError;
  }

  public subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }
}

export default ApiCostService;