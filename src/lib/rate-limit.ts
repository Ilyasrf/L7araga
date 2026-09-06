interface RateLimitOptions {
  interval: number; // in milliseconds
  uniqueTokenPerInterval: number; // Max users to track per interval
}

export default function rateLimit(options?: RateLimitOptions) {
  const tokenCache = new Map<string, number[]>();
  const interval = options?.interval || 60000;

  return {
    check: (limitCount: number, token: string): Promise<void> =>
      new Promise((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limitCount;

        // Reset the token count after the interval
        setTimeout(() => {
          const currentTokenCount = tokenCache.get(token);
          if (currentTokenCount) {
            currentTokenCount[0] -= 1;
            if (currentTokenCount[0] === 0) {
              tokenCache.delete(token);
            }
          }
        }, interval);

        if (isRateLimited) {
          reject(new Error('Rate limit exceeded'));
        } else {
          resolve();
        }
      }),
  };
}
