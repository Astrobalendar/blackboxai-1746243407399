import useSWR from 'swr';

// Utility to get start/end of today in UTC for Firestore timestamp comparison
function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

// Fetcher for the API endpoint
const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.json())
    .then((data) => data.count ?? 0);

export default function useTodayFeedbackCount(token: string) {
  const { start, end } = getTodayRange();
  const { data, error, isLoading } = useSWR(
    token ? [`/api/research/feedback-count?from=${start}&to=${end}`, token] : null,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );
  return {
    count: data ?? 0,
    error,
    isLoading,
  };
}
