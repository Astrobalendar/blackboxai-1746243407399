import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import BirthDataForm from '../components/BirthDataForm';
import { toast } from 'react-toastify';

interface DuplicateHoroscope {
  id: string;
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  locationName: string;
}

const NewHoroscopePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<DuplicateHoroscope | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  
  // Check for pending horoscope data or duplicate warning in location state
  useEffect(() => {
    // Handle pending horoscope data after login
    const pendingHoroscopeData = location.state?.formData;
    const checkForDup = location.state?.checkForDuplicate;
    const forceCreate = location.state?.forceCreate;

    if (pendingHoroscopeData) {
      // If we're forcing creation, submit the form immediately
      if (forceCreate) {
        handleSubmit({ ...pendingHoroscopeData, forceCreate: true });
        return;
      }
      
      // If we need to check for duplicates, do that
      if (checkForDup) {
        checkForDuplicate(pendingHoroscopeData).then(duplicate => {
          if (duplicate) {
            setDuplicate(duplicate);
            setShowDuplicateWarning(true);
          } else {
            // No duplicate, proceed with submission
            handleSubmit(pendingHoroscopeData);
          }
        }).catch(err => {
          console.error('Error checking for duplicates:', err);
          toast.error('Error checking for duplicate horoscopes');
        });
      }
      
      // Clear the state to prevent reprocessing
      window.history.replaceState({}, document.title);
    } else if (location.state?.duplicate) {
      // Handle case where we're coming back from login with a duplicate warning
      setDuplicate(location.state.duplicate);
      setShowDuplicateWarning(true);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const checkForDuplicate = async (data: any) => {
    if (!auth.currentUser) {
      // If user is not logged in, save the data to session storage
      // and redirect to login with a return URL
      sessionStorage.setItem('pendingHoroscopeData', JSON.stringify(data));
      navigate('/login', { 
        state: { 
          from: '/new-horoscope',
          message: 'Please log in to check for duplicate horoscopes.'
        } 
      });
      return null;
    }
    
    try {
      const horoscopesRef = collection(db, `users/${auth.currentUser.uid}/horoscopes`);
      const q = query(
        horoscopesRef,
        where('fullName', '==', data.fullName),
        where('dateOfBirth', '==', data.dateOfBirth),
        where('timeOfBirth', '==', data.timeOfBirth)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          fullName: doc.data().fullName,
          dateOfBirth: doc.data().dateOfBirth,
          timeOfBirth: doc.data().timeOfBirth,
          locationName: doc.data().locationName
        } as DuplicateHoroscope;
      }
      return null;
    } catch (err) {
      console.error('Error checking for duplicate horoscope:', err);
      throw new Error('Unable to check for duplicates. Please try again.');
    }
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setDuplicate(null);
    setShowDuplicateWarning(false);
    
    try {
      // First check for duplicates
      const existingHoroscope = await checkForDuplicate(data);
      
      if (existingHoroscope) {
        setDuplicate(existingHoroscope);
        setShowDuplicateWarning(true);
        setLoading(false);
        return;
      }
      
      // If no duplicate, proceed with creating new horoscope
      navigate('/prediction', { 
        state: { 
          birthData: data,
          isNew: true
        } 
      });
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process horoscope. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnyway = () => {
    if (!duplicate) return;
    
    const { fullName, dateOfBirth, timeOfBirth, locationName } = duplicate;
    
    // If user is not logged in, save the data and redirect to login
    if (!auth.currentUser) {
      sessionStorage.setItem('pendingHoroscopeData', JSON.stringify({
        fullName,
        dateOfBirth,
        timeOfBirth,
        locationName,
        forceCreate: true
      }));
      
      navigate('/login', { 
        state: { 
          from: '/new-horoscope',
          message: 'Please log in to create a new horoscope.',
          forceCreate: true
        } 
      });
      return;
    }
    
    // If user is logged in, proceed with force creation
    navigate('/prediction', { 
      state: { 
        birthData: {
          fullName,
          dateOfBirth,
          timeOfBirth,
          locationName
        },
        isNew: true,
        forceCreate: true
      } 
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200">
      <div className="w-full max-w-lg bg-white/95 rounded-3xl shadow-2xl p-10 border border-yellow-200 flex flex-col gap-6">
        <h1 className="text-5xl font-black text-yellow-900 mb-4 text-center tracking-tight drop-shadow-lg">New Horoscope Entry</h1>
        <div className="mb-4 text-gray-800 text-center text-lg font-medium">
          Enter your birth details below to generate your personalized KP Stellar Horoscope prediction.<br />
          <span className="text-yellow-700 text-base">All fields are required.</span>
        </div>
        <div className="rounded-2xl shadow-xl bg-white/80 p-6 md:p-8 border border-yellow-100">
          <div className="space-y-4">
            {showDuplicateWarning && duplicate && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg 
                      className="h-5 w-5 text-yellow-400" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Duplicate Horoscope Found</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        A horoscope for <span className="font-semibold">{duplicate.fullName}</span> with 
                        the same birth details already exists in your account.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3">
                        <Link 
                          to={`/prediction/${duplicate.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          View Existing Horoscope
                        </Link>
                        <button
                          type="button"
                          onClick={handleCreateAnyway}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          Create New Anyway
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white/80 p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Enter Birth Details</h2>
              <BirthDataForm
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
              />
              
              {error && !showDuplicateWarning && (
                <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHoroscopePage;
