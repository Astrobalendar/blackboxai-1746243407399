import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";

interface ProfileData {
  name: string;
  birthDate: string;
  birthTime: string;
  location: string;
}

interface NewProfileFormProps {
  onProfileCreated: (profileId: string, profileData: ProfileData) => void;
}

const NewProfileForm: React.FC<NewProfileFormProps> = ({ onProfileCreated }) => {
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    birthDate: "",
    birthTime: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const uid = auth.currentUser.uid;
      const profileId = `${Date.now()}`;
      const docRef = doc(db, `users/${uid}/profiles/${profileId}`);
      await setDoc(docRef, {
        ...formData,
        createdAt: serverTimestamp(),
      });
      onProfileCreated(profileId, formData);
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </label>
      </div>
      <div>
        <label>
          Birth Date:
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </label>
      </div>
      <div>
        <label>
          Birth Time:
          <input
            type="time"
            name="birthTime"
            value={formData.birthTime}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </label>
      </div>
      <div>
        <label>
          Location:
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 rounded ${
          loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
};

export default NewProfileForm;
