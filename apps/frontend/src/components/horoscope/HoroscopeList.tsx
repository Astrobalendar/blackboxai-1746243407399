import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { useRouter } from 'next/router';
import styles from './HoroscopeList.module.css';
import React from 'react';

interface HoroscopeDocument {
  id: string;
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  createdAt: any;
  chartData: {
    rasi: any[];
    navamsa: any[];
  };
}

interface HoroscopeListProps {
  astrologerId: string;
}

const HoroscopeList: React.FC<HoroscopeListProps> = ({ astrologerId }) => {
  const [horoscopes, setHoroscopes] = useState<HoroscopeDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const q = query(
        collection(db, 'horoscopes'),
        where('astrologerId', '==', astrologerId),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as HoroscopeDocument[];
          setHoroscopes(docs);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error fetching horoscopes:', error);
          setError('Failed to load horoscopes. Please try again.');
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up horoscope listener:', error);
      setError('Failed to set up horoscope listener.');
      setIsLoading(false);
    }
  }, [astrologerId]);

  const filteredHoroscopes = horoscopes.filter(h => 
    h.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this horoscope?')) {
      try {
        await deleteDoc(doc(db, 'horoscopes', id));
      } catch (error) {
        console.error('Error deleting horoscope:', error);
        alert('Failed to delete horoscope');
      }
    }
  };

  if (isLoading) return <div>Loading horoscopes...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Horoscopes</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Birth Date</th>
              <th>Birth Place</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHoroscopes.length > 0 ? (
              filteredHoroscopes.map((horoscope) => (
                <tr key={horoscope.id}>
                  <td>{horoscope.fullName}</td>
                  <td>{new Date(horoscope.birthDate).toLocaleDateString()}</td>
                  <td>{horoscope.birthPlace}</td>
                  <td>
                    {horoscope.createdAt?.toDate
                      ? horoscope.createdAt.toDate().toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    <a 
                      href={`/horoscope/${horoscope.id}`}
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/horoscope/${horoscope.id}`);
                      }}
                    >
                      View
                    </a>
                    <button 
                      onClick={() => handleDelete(horoscope.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.noData}>
                  No horoscopes found. Create your first horoscope to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoroscopeList;
