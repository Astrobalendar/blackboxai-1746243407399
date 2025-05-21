# Astrobalendar File Structure Cleanup Report

## Cleanup Summary
This document details the file structure changes made to remove duplicates and improve code organization in the Astrobalendar project.

## Removed Files

### 1. Firebase Configuration
- **Removed**: `./apps/frontend/src/lib/firebase.ts`
  - **Reason**: Duplicate file that simply re-exported from the main firebase.ts
- **Removed**: `./apps/frontend/src/lib/firebase/config.ts`
  - **Reason**: Contained hardcoded credentials, using environment variables instead

### 2. Utility Files
- **Removed**: `./apps/frontend/lib/utils.ts`
  - **Reason**: Duplicate of the version in src/lib/
  - **Kept**: `./apps/frontend/src/lib/utils.ts`

### 3. Global Type Definitions
- **Merged**: `./apps/frontend/src/global.d.ts` into `./apps/frontend/src/types/global.d.ts`
  - **Reason**: Consolidated type definitions into a single location
  - **Removed**: Original `global.d.ts` after merging

### 4. Component Files (Moved from pages/ to components/)
- **Moved from pages/ to components/**:
  - `BirthDataForm.tsx`
  - `HoroscopeGenerator.tsx`
  - `NewHoroscope.tsx`
  - `HoroscopeList.tsx` (moved to components/horoscope/)
  - `PredictionView.tsx` (moved to components/prediction/)

### 5. Data Files
- **Removed**: `./apps/frontend/src/data/locationData.ts`
  - **Reason**: Duplicate of the version in src/lib/
  - **Kept**: `./apps/frontend/src/lib/locationData.ts` (more comprehensive data)

### 6. API and Service Files
- **Removed**: `./apps/frontend/src/utils/api.ts`
  - **Reason**: Less comprehensive version of the API service
  - **Kept**: `./apps/frontend/src/services/api.ts` (better TypeScript support and error handling)

### 7. Type Definitions
- **Renamed**: `./apps/frontend/src/types/astrology.ts` → `./apps/frontend/src/types/astrology.types.ts`
  - **Reason**: Better naming convention for type definition files

## Current File Structure (Key Files)

```
apps/
  frontend/
    src/
      components/
        BirthDataForm.tsx
        HoroscopeGenerator.tsx
        NewHoroscope.tsx
        horoscope/
          HoroscopeList.tsx
        prediction/
          PredictionView.tsx
      firebase/
        config.ts
        firebase.ts
      lib/
        firebaseProfileService.ts
        locationData.ts
        utils.ts
      services/
        api.ts
        astrology.ts
      types/
        global.d.ts
        astrology.types.ts
      App.tsx
      main.tsx
      ...
```

## Next Steps

1. **Update Imports**:
   - Replace any imports pointing to removed files with the correct paths
   - Update import paths for moved components

2. **Verify Functionality**:
   - Test all application features to ensure everything works as expected
   - Pay special attention to Firebase functionality and API calls

3. **Consider Additional Improvements**:
   - Add ESLint rules to prevent duplicate files
   - Document the project structure in a CONTRIBUTING.md file
   - Consider adding path aliases in TypeScript config for cleaner imports

## Notes
- All sensitive information (API keys, etc.) should be managed through environment variables
- The new structure follows a more modular approach with clear separation of concerns
- TypeScript types are now better organized and more consistently named
