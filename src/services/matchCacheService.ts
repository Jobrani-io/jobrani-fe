import { JobMatch } from './savedProspectsService';

export interface CachedMatchResult {
	matches: JobMatch[];
	cachedAt: number;
	query: string;
	jobId: string;
	company: string;
	jobTitle: string;
	location?: string;
	userId: string;
}

export interface CacheKey {
	query?: string;
	jobId: string;
	company: string;
	jobTitle: string;
	location?: string;
	userId: string;
}

class MatchCacheService {
	private readonly CACHE_KEY = 'jobrani_match_cache_array';
	private readonly CACHE_EXPIRY_HOURS = 24 * 30;

	private normalizeKey(params: CacheKey): string {
		const { query = '', jobId, company, jobTitle, location = '', userId } = params;
		return JSON.stringify({
			query,
			jobId,
			company: company.toLowerCase().trim(),
			jobTitle: jobTitle.toLowerCase().trim(),
			location: location.toLowerCase().trim(),
			userId
		});
	}

	private getCacheArray(): CachedMatchResult[] {
		try {
			const cached = localStorage.getItem(this.CACHE_KEY);
			return cached ? JSON.parse(cached) : [];
		} catch (error) {
			console.error('Error reading cache array:', error);
			return [];
		}
	}

	private saveCacheArray(cache: CachedMatchResult[]): void {
		try {
			localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
		} catch (error) {
			console.error('Error saving cache array:', error);
		}
	}

	getCachedMatches(params: CacheKey): JobMatch[] | null {
		try {
			const normalizedKey = this.normalizeKey(params);
			const cache = this.getCacheArray();
			const now = Date.now();
			const expiryTime = this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

			const cachedResult = cache.find((item) => this.normalizeKey(item) === normalizedKey);

			if (!cachedResult) {
				return null;
			}

			// Check if cache is expired
			const cacheAge = now - cachedResult.cachedAt;
			if (cacheAge > expiryTime) {
				// Remove expired entry
				const updatedCache = cache.filter((item) => this.normalizeKey(item) !== normalizedKey);
				this.saveCacheArray(updatedCache);
				return null;
			}

			return cachedResult.matches;
		} catch (error) {
			console.error('Error reading from match cache:', error);
			return null;
		}
	}

	cacheMatches(params: CacheKey, matches: JobMatch[]): void {
		try {
			const normalizedKey = this.normalizeKey(params);
			const cache = this.getCacheArray();

			const cachedResult: CachedMatchResult = {
				matches,
				cachedAt: Date.now(),
				query: params.query || '',
				jobId: params.jobId,
				company: params.company,
				jobTitle: params.jobTitle,
				location: params.location,
				userId: params.userId
			};

			// Remove existing entry if it exists
			const updatedCache = cache.filter((item) => this.normalizeKey(item) !== normalizedKey);
			updatedCache.push(cachedResult);

			this.saveCacheArray(updatedCache);
		} catch (error) {
			console.error('Error writing to match cache:', error);
		}
	}

	getAllCachedMatches(userId: string): Map<string, JobMatch[]> {
		try {
			const cache = this.getCacheArray();
			const now = Date.now();
			const expiryTime = this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000;
			const result = new Map<string, JobMatch[]>();
			const validCache: CachedMatchResult[] = [];

			cache.forEach((item) => {
				if (item.userId === userId) {
					const cacheAge = now - item.cachedAt;
					if (cacheAge <= expiryTime) {
						result.set(item.jobId, item.matches);
						validCache.push(item);
					}
				} else {
					validCache.push(item);
				}
			});

			// Update cache to remove expired entries
			if (validCache.length !== cache.length) {
				this.saveCacheArray(validCache);
			}

			return result;
		} catch (error) {
			console.error('Error getting all cached matches:', error);
			return new Map();
		}
	}

	getProspectsWithCachedMatches(
		prospects: Array<{
			prospectId: string;
			company: string;
			jobTitle: string;
			location?: string;
		}>,
		userId: string
	): Array<{
		prospect: {
			prospectId: string;
			company: string;
			jobTitle: string;
			location?: string;
		};
		cachedMatches: JobMatch[];
	}> {
		return prospects
			.map((prospect) => {
				const cachedMatches = this.getCachedMatches({
					jobId: prospect.prospectId,
					company: prospect.company,
					jobTitle: prospect.jobTitle,
					location: prospect.location,
					userId
				});

				if (cachedMatches) {
					return {
						prospect,
						cachedMatches
					};
				}
				return null;
			})
			.filter((item) => item !== null) as Array<{
			prospect: {
				prospectId: string;
				company: string;
				jobTitle: string;
				location?: string;
			};
			cachedMatches: JobMatch[];
		}>;
	}

	getUncachedProspects(
		prospects: Array<{
			prospectId: string;
			company: string;
			jobTitle: string;
			location?: string;
		}>,
		userId: string
	): Array<{
		prospectId: string;
		company: string;
		jobTitle: string;
		location?: string;
	}> {
		return prospects.filter((prospect) => {
			const cachedMatches = this.getCachedMatches({
				jobId: prospect.prospectId,
				company: prospect.company,
				jobTitle: prospect.jobTitle,
				location: prospect.location,
				userId
			});
			return cachedMatches === null;
		});
	}

	clearExpiredCache(): void {
		try {
			const cache = this.getCacheArray();
			const now = Date.now();
			const expiryTime = this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

			const validCache = cache.filter((item) => {
				const cacheAge = now - item.cachedAt;
				return cacheAge <= expiryTime;
			});

			if (validCache.length !== cache.length) {
				this.saveCacheArray(validCache);
				console.log(`Cleared ${cache.length - validCache.length} expired cache entries`);
			}
		} catch (error) {
			console.error('Error clearing expired cache:', error);
		}
	}

	clearCachedMatches(params: CacheKey): void {
		try {
			const normalizedKey = this.normalizeKey(params);
			const cache = this.getCacheArray();

			const updatedCache = cache.filter((item) => this.normalizeKey(item) !== normalizedKey);

			if (updatedCache.length !== cache.length) {
				this.saveCacheArray(updatedCache);
				console.log(`Cleared cache for job ${params.jobId}`);
			}
		} catch (error) {
			console.error('Error clearing cached matches:', error);
		}
	}

	clearAllCache(): void {
		try {
			localStorage.removeItem(this.CACHE_KEY);
			console.log('Cleared all match cache');
		} catch (error) {
			console.error('Error clearing all cache:', error);
		}
	}
}

export default new MatchCacheService();
