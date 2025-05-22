/// <reference lib="dom" />
/* global window, document, console, Blob */
import React, { useState } from 'react';
import { generatePdf, generateUniqueFilename, downloadBlob } from '../lib/export-utils';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthProvider';
import { toast } from 'react-toastify';

import type { PredictionData, HoroscopeInput } from '@/shared/types/prediction';

interface ExportPanelProps {
  prediction: PredictionData;
  birthData: HoroscopeInput;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ prediction, birthData }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<'pdf' | 'firestore' | null>(null);

  // PDF Export Handler
  const handleExportPdf = async () => {
    setLoading('pdf');
    try {
      const blob = await generatePdf('prediction-content');
      const filename = generateUniqueFilename('kp_prediction', 'pdf');
      downloadBlob(blob, filename);
      toast.success('PDF exported successfully!');
    } catch (err: any) {
      toast.error('PDF export failed.');
    } finally {
      setLoading(null);
    }
  };

  // Firestore Save Handler
  const handleSaveFirestore = async () => {
    setLoading('firestore');
    try {
      if (!user) {
        toast.error('You must be logged in to save predictions.');
        setLoading(null);
        return;
      }
      // Validate required fields
      const { fullName, dateOfBirth, timeOfBirth } = birthData;
      if (!fullName || !dateOfBirth || !timeOfBirth) {
        toast.error('Missing required birth data fields.');
        setLoading(null);
        return;
      }
      const db = getFirestore();
      const horoscopesRef = collection(db, `users/${user.uid}/horoscopes`);
      // Optional: Duplicate check (fullName + dateOfBirth)
      const q = query(
        horoscopesRef,
        where('birthData.fullName', '==', fullName),
        where('birthData.dateOfBirth', '==', dateOfBirth)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        toast.error('A prediction with this name and date of birth already exists.');
        setLoading(null);
        return;
      }
      // Save with type safety
      await addDoc(horoscopesRef, {
        birthData: { ...birthData },
        prediction,
        createdAt: serverTimestamp(),
      });
      toast.success('Prediction saved to Firestore!');
    } catch (err: any) {
      toast.error('Failed to save to Firestore.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-4 mt-4">
      <button
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
        onClick={handleExportPdf}
        disabled={loading !== null}
      >
        {loading === 'pdf' ? 'Exporting PDF...' : 'Export PDF'}
      </button>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        onClick={handleSaveFirestore}
        disabled={loading !== null}
      >
        {loading === 'firestore' ? 'Saving...' : 'Save to Firestore'}
      </button>
    </div>
  );
};

export default ExportPanel;
