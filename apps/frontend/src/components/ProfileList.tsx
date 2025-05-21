import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuthSafe, getDbSafe } from "../firebase";

interface Profile {
  id: string;
  fullName: string;
  birthDate: string;
}

interface ProfileListProps {
  onProfileSelected: (profileId: string) => void;
}

const ProfileList: React.FC<ProfileListProps> = ({ onProfileSelected }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      const auth = getAuthSafe();
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        const uid = auth.currentUser.uid;
        const profilesRef = collection(getDbSafe(), `users/${uid}/profiles`);
        const snapshot = await getDocs(profilesRef);
        const profilesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Profile[];
        setProfiles(profilesData);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleDelete = async (profileId: string) => {
    const auth = getAuthSafe();
    if (!auth.currentUser) return;
    try {
      const uid = auth.currentUser.uid;
      await deleteDoc(doc(getDbSafe(), `users/${uid}/profiles/${profileId}`));
      setProfiles((prev) => prev.filter((profile) => profile.id !== profileId));
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Saved Profiles</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {profiles.map((profile) => (
            <li key={profile.id} className="flex justify-between items-center">
              <span>
                {profile.fullName} - {profile.birthDate}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onProfileSelected(profile.id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Load
                </button>
                <button
                  onClick={() => handleDelete(profile.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileList;
