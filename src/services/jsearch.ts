/**
 * @deprecated This service is no longer called from the frontend.
 * JSearch API calls now happen server-side via Edge Function (job-sync).
 * Frontend queries cached jobs from Supabase instead.
 *
 * This file is kept for reference only - safe to delete after Phase 2.5 verification.
 */

import axios from 'axios';
import type { Job } from '../types/job';

// Create axios instance for JSearch API
const jsearchApi = axios.create({
  baseURL: 'https://jsearch.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': import.meta.env.VITE_JSEARCH_API_KEY || '',
    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
  },
});

export interface JobSearchParams {
  query: string;
  num_pages?: number;
  page?: number;
}

export interface JSearchResponse {
  status: string;
  request_id: string;
  data: Job[];
}

/**
 * Search for jobs using JSearch API
 * Default query targets fast food crew member positions in USA
 * Limited to 1 page (~10 jobs) to conserve API quota (500 req/month free tier)
 */
export async function searchJobs(params?: JobSearchParams): Promise<Job[]> {
  const searchParams: JobSearchParams = {
    query: params?.query || 'fast food crew member USA',
    num_pages: params?.num_pages || 1,
    page: params?.page || 1,
  };

  try {
    const response = await jsearchApi.get<JSearchResponse>('/search', {
      params: searchParams,
    });

    // Log response shape for development debugging
    if (import.meta.env.DEV) {
      console.log('[JSearch] Response received:', {
        status: response.data.status,
        jobCount: response.data.data?.length || 0,
      });
    }

    return response.data.data || [];
  } catch (error) {
    // Handle rate limit errors specifically
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      console.error('[JSearch] Rate limit exceeded. Free tier allows 500 requests/month.');
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    // Handle missing or invalid API key
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      console.error('[JSearch] Invalid or missing API key. Check VITE_JSEARCH_API_KEY in .env.local');
      throw new Error('Invalid API key. Please check your JSearch API configuration.');
    }

    // Handle other errors
    if (axios.isAxiosError(error)) {
      console.error('[JSearch] API error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    throw error;
  }
}
