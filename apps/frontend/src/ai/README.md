# KP AI/ML Module (Stellar Prediction Engine)

## Purpose
Modular architecture for KP Paddhati-based AI/ML predictions, including:
- Input data processing
- Feature transformation based on KP rules
- Model training and evaluation
- Real-time prediction engine

## Structure
- `models/`: Trained ML models (to be loaded by predict/)
- `datasets/`: Input data (e.g., horoscope, planetary, transit data)
- `processors/`: Domain-specific pre-processing logic
- `predict/`: Main runtime module for predictions

## Getting Started
- Add new data to `datasets/`
- Add model training logic in `models/`
- Add feature pipelines to `processors/`
- Call `predict/engine.ts` for live predictions

## Notes
Models should be interpretable and traceable. All predictions must be explainable by KP rule logic.
