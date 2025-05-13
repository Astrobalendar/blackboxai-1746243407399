import React, { useState } from 'react';

const PredictionCard = ({ title, content, editable, onEdit }: any) => {
  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState(content || '');

  const handleSave = () => {
    setEditMode(false);
    if (onEdit) onEdit(title, value);
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      {editable && editMode ? (
        <>
          <textarea className="w-full border rounded p-2 mb-2" value={value} onChange={e => setValue(e.target.value)} />
          <button className="btn btn-success mr-2" onClick={handleSave}>Save</button>
          <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
        </>
      ) : (
        <>
          <p className="text-gray-700 mb-2">{value}</p>
          {editable && <button className="btn btn-outline" onClick={() => setEditMode(true)}>Edit</button>}
        </>
      )}
    </div>
  );
};

export default PredictionCard;
