import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import Papa from 'papaparse';
import { useAuth } from '../context/AuthProvider';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  deleteDoc,
  doc,
  DocumentData,
  QueryDocumentSnapshot,
  Query,
  where,
  or,
  and,
  getCountFromServer,
  updateDoc,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FirebaseError } from 'firebase/app';

interface Horoscope extends DocumentData {
  id: string;
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  locationName: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
  status?: 'New' | 'Reviewed' | 'Archived';
  createdBy?: { uid: string; fullName: string };
  // Add any other fields that might exist in your documents
  [key: string]: any;
}

interface FetchHoroscopesResult {
  data: Horoscope[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const PAGE_SIZE = 10;
const LOCAL_STORAGE_KEY = 'horoscopeListState';

const STATUS_COLORS = {
  New: 'bg-green-100 text-green-800',
  Reviewed: 'bg-blue-100 text-blue-800',
  Archived: 'bg-gray-100 text-gray-800',
};

const STATUS_OPTIONS = ['New', 'Reviewed', 'Archived'] as const;

type StatusType = typeof STATUS_OPTIONS[number];

const HoroscopeList: React.FC = () => {
  const [horoscopes, setHoroscopes] = useState<Horoscope[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [pageStack, setPageStack] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [createdByFilter, setCreatedByFilter] = useState<string>('');
  const [astrologerOptions, setAstrologerOptions] = useState<{uid: string; fullName: string}[]>([]);
  const [statusEdit, setStatusEdit] = useState<{id: string; status: StatusType} | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Load persisted state
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      setSearch(state.search || '');
      setCreatedByFilter(state.createdByFilter || '');
    }
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ search, createdByFilter }));
  }, [search, createdByFilter]);

  // Debounced search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  // Fetch astrologer options for admin filter
  useEffect(() => {
    if (userRole === 'admin') {
      (async () => {
        const q = query(collection(db, 'horoscopes'));
        const snapshot = await getDocs(q);
        const unique = new Map();
        snapshot.docs.forEach(docSnap => {
          const d = docSnap.data();
          if (d.createdBy && d.createdBy.uid && d.createdBy.fullName) {
            unique.set(d.createdBy.uid, d.createdBy.fullName);
          }
        });
        setAstrologerOptions(Array.from(unique.entries()).map(([uid, fullName]) => ({ uid, fullName })));
      })();
    }
  }, [userRole]);

  const executeQuery = async (q: Query<DocumentData>, retry = 0): Promise<FetchHoroscopesResult> => {
    try {
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as Horoscope[];
      
      return {
        data: docs,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === PAGE_SIZE
      };
    } catch (err) {
      const error = err as FirebaseError;
      console.error('Firestore query error:', error);
      
      if (retry < MAX_RETRIES) {
        console.log(`Retrying query (${retry + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retry + 1)));
        return executeQuery(q, retry + 1);
      }
      
      throw new Error(`Failed to fetch horoscopes: ${error.message}`);
    }
  };

  const buildQuery = (cursor: QueryDocumentSnapshot<DocumentData> | null = null) => {
    let q = query(
      collection(db, 'horoscopes'),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    );

    // Apply search filter if search term exists
    if (search) {
      const searchLower = search.toLowerCase();
      q = query(
        q,
        or(
          where('fullName', '>=', searchLower),
          where('fullName', '<=', searchLower + '\uf8ff'),
          where('locationName', '>=', searchLower),
          where('locationName', '<=', searchLower + '\uf8ff')
        )
      );
    }

    // Apply createdBy filter if set
    if (createdByFilter) {
      q = query(q, where('createdBy.uid', '==', createdByFilter));
    }

    // Apply pagination cursor
    if (cursor) {
      q = query(q, startAfter(cursor));
    }

    return q;
  };

  const fetchHoroscopes = useCallback(async (reset = false) => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);

    try {
      const q = buildQuery(reset ? null : lastDoc);
      const { data, lastVisible, hasMore } = await executeQuery(q);
      
      if (!isMounted.current) return;
      
      setHoroscopes(prev => reset ? data : [...prev, ...data]);
      setLastDoc(lastVisible);
      setHasMore(hasMore);
      setRetryCount(0);
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching horoscopes:', error);
      if (isMounted.current) {
        setError(error.message);
        toast.error('Failed to load horoscopes. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [lastDoc, search, createdByFilter]);

  // Handle component mount/unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch data when dependencies change
  useEffect(() => {
    if (!authLoading) {
      fetchHoroscopes(true);
    }
  }, [authLoading, userRole, user, createdByFilter, search, fetchHoroscopes]);

  // Retry failed fetches
  useEffect(() => {
    if (error && retryCount < MAX_RETRIES) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchHoroscopes(true);
      }, RETRY_DELAY_MS * (retryCount + 1));
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, fetchHoroscopes]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // filteredHoroscopes is now just horoscopes (already filtered in fetchHoroscopes)
const filteredHoroscopes = horoscopes;

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this horoscope? This action cannot be undone.')) {
      return;
    }
    
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'horoscopes', id));
      
      if (isMounted.current) {
        setHoroscopes((prev) => prev.filter((h) => h.id !== id));
        toast.success('Horoscope deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting horoscope:', err);
      if (isMounted.current) {
        toast.error('Failed to delete horoscope');
      }
    } finally {
      if (isMounted.current) {
        setDeletingId(null);
        setShowConfirm(false);
        setDeleteTarget(null);
      }
    }
  };

  const formatDate = (timestamp?: { seconds: number; nanoseconds: number } | null, short = false) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return short ? date.toISOString().slice(0, 10) : date.toLocaleString();
  };

  // CSV Export
  const handleExportCSV = () => {
    const data = filteredHoroscopes.map(h => ({
      fullName: h.fullName,
      dateOfBirth: h.dateOfBirth,
      timeOfBirth: h.timeOfBirth,
      placeOfBirth: h.locationName,
      createdAt: formatDate(h.createdAt, true),
      status: h.status || '',
      documentId: h.id,
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `horoscopes_export_${formatDate({ seconds: Math.floor(Date.now()/1000), nanoseconds: 0 }, true)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Status Update
  const handleStatusChange = async (id: string, status: StatusType) => {
    setStatusEdit({ id, status });
    try {
      await import('firebase/firestore').then(({ updateDoc, doc: docFn }) =>
        updateDoc(docFn(db, 'horoscopes', id), { status })
      );
      setHoroscopes(prev => prev.map(h => h.id === id ? { ...h, status } : h));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setStatusEdit(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-yellow-900">Horoscope List</h1>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
          {userRole === 'admin' && (
            <label htmlFor="createdByFilter" className="sr-only">Created By</label>
            <select
              id="createdByFilter"
              title="Created By"
              className="border border-yellow-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={createdByFilter}
              onChange={e => setCreatedByFilter(e.target.value)}
              aria-label="Filter by astrologer"
            >
              <option value="">All Astrologers</option>
              {astrologerOptions.map(opt => (
                <option key={opt.uid} value={opt.uid}>{opt.fullName}</option>
              ))}
            </select>
          )}
          <label htmlFor="horoscopeSearch" className="sr-only">Search horoscopes</label>
          <input
            id="horoscopeSearch"
            type="text"
            placeholder="Search by name or place..."
            value={searchInput}
            onChange={handleSearch}
            className="border border-yellow-200 rounded-lg px-4 py-2 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Search horoscopes"
          />
          <button
            className="ml-2 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg font-bold shadow hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            onClick={handleExportCSV}
          >
            Export as CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white/80">
        <table className="min-w-full divide-y divide-yellow-200">
          <thead className="bg-yellow-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 uppercase">Full Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 uppercase">DOB</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 uppercase">TOB</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 uppercase">Place</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 uppercase">Created At</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <span className="loader inline-block w-6 h-6 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
                </td>
              </tr>
            ) : filteredHoroscopes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-yellow-600 font-semibold">No records found</td>
              </tr>
            ) : (
              filteredHoroscopes.map((h) => (
                <tr key={h.id} className="hover:bg-yellow-50 transition">
                  <td className="px-4 py-3">{h.fullName}</td>
                  <td className="px-4 py-3">{h.dateOfBirth}</td>
                  <td className="px-4 py-3">{h.timeOfBirth}</td>
                  <td className="px-4 py-3">{h.locationName}</td>
                  <td className="px-4 py-3">{formatDate(h.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold cursor-${userRole==='admin'?'pointer':'default'} ${STATUS_COLORS[h.status || 'New']}`}
                      tabIndex={userRole==='admin'?0:-1}
                      onClick={userRole==='admin'?()=>setStatusEdit({id: h.id, status: h.status as StatusType || 'New'}):undefined}
                      aria-label={userRole==='admin' ? 'Edit status' : 'Status'}
                      role="status"
                    >
                      {h.status || 'New'}
                    </span>
                    {statusEdit && statusEdit.id === h.id && userRole==='admin' && (
                      <span>
                        <label htmlFor={`statusSelect-${h.id}`} className="sr-only">Change status</label>
                        <select
                          id={`statusSelect-${h.id}`}
                          title="Change status"
                          className="ml-2 px-2 py-1 rounded border border-gray-300 text-xs"
                          value={statusEdit.status}
                          onChange={e => handleStatusChange(h.id, e.target.value as StatusType)}
                          onBlur={()=>setStatusEdit(null)}
                          autoFocus
                          aria-label="Change status"
                        >
                          {STATUS_OPTIONS.map(opt=>(<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2 items-center">
                    <button
                      className="text-blue-700 hover:underline focus:outline-none"
                      aria-label="View Horoscope"
                      onClick={() => navigate(`/prediction/${h.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="text-yellow-700 hover:underline focus:outline-none"
                      aria-label="Edit Horoscope"
                      onClick={() => navigate(`/horoscope/new?edit=${h.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-700 hover:underline focus:outline-none"
                      aria-label="Delete Horoscope"
                      onClick={() => { setDeleteTarget(h.id); setShowConfirm(true); }}
                      disabled={deletingId === h.id}
                    >
                      {deletingId === h.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex flex-col items-center justify-center mt-6 gap-4">
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-yellow-200 text-yellow-900 rounded-lg font-bold shadow hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            onClick={() => fetchHoroscopes(false, 'prev')}
            disabled={pageStack.length <= 1}
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            className="px-4 py-2 bg-yellow-200 text-yellow-900 rounded-lg font-bold shadow hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            onClick={() => fetchHoroscopes(false, 'next')}
            disabled={!hasMore}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
        <span className="text-sm text-gray-600 mt-2" aria-live="polite">Page {pageStack.length}</span>
      </div>
      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this horoscope?</p>
            <div className="flex justify-end gap-4 mt-6">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                onClick={() => { setShowConfirm(false); setDeleteTarget(null); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                onClick={() => deleteTarget && handleDelete(deleteTarget)}
                disabled={deletingId === deleteTarget}
              >
                {deletingId === deleteTarget ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoroscopeList;
