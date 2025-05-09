import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

        "sub_sub_lord": "Jupiter",
        "ruling_planets": ["Mars", "Venus", "Saturn"],
    }

    match_status = (
        "match"
        if prediction_result["sub_sub_lord"] in prediction_result["ruling_planets"]
        else "needs_correction"
    )

    return {
        "prediction": prediction_result,
        "match_status": match_status,
    }
