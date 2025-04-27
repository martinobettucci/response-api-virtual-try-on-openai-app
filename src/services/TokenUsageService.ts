const STORAGE_KEY = 'token-usage';

interface TokenUsage {
  inputTextTokens: number;
  inputImageTokens: number;
  outputTokens: number;
}

class TokenUsageService {
  private static instance: TokenUsageService;
  private usage: TokenUsage;
  private subscribers: Set<() => void>;

  private constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    this.usage = stored ? JSON.parse(stored) : {
      inputTextTokens: 0,
      inputImageTokens: 0,
      outputTokens: 0
    };
    this.subscribers = new Set();
  }

  public static getInstance(): TokenUsageService {
    if (!TokenUsageService.instance) {
      TokenUsageService.instance = new TokenUsageService();
    }
    return TokenUsageService.instance;
  }

  public addUsage(newUsage: { input_tokens_details?: { text_tokens: number; image_tokens: number }; output_tokens?: number }) {
    this.usage = {
      inputTextTokens: this.usage.inputTextTokens + (newUsage.input_tokens_details?.text_tokens || 0),
      inputImageTokens: this.usage.inputImageTokens + (newUsage.input_tokens_details?.image_tokens || 0),
      outputTokens: this.usage.outputTokens + (newUsage.output_tokens || 0)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.usage));
    this.notifySubscribers();
  }

  public getUsage(): TokenUsage {
    return { ...this.usage };
  }

  public reset() {
    this.usage = {
      inputTextTokens: 0,
      inputImageTokens: 0,
      outputTokens: 0
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.usage));
    this.notifySubscribers();
  }

  public subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }
}

export default TokenUsageService