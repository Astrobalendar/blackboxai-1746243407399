#!/bin/bash

# Rename .ts files containing JSX to .tsx

files=(
  "akura-astrology-automation/scripts/index.ts"
  "apps/frontend/src/ai/models/trainModel.ts"
  "apps/frontend/src/ai/predict/engine.ts"
  "apps/frontend/src/api/upload-horoscopes.ts"
  "apps/frontend/src/hooks/useEmailPrediction.ts"
  "apps/frontend/src/hooks/useHoroscopeForm.ts"
  "apps/frontend/src/hooks/useKPChart.ts"
  "apps/frontend/src/hooks/usePredictionExport.ts"
  "apps/frontend/src/hooks/usePredictionExportV2.ts"
  "apps/frontend/src/hooks/useResizeObserver.ts"
  "apps/frontend/src/hooks/useUserHoroscopes.ts"
  "apps/frontend/src/lib/export-utils.ts"
  "apps/frontend/src/lib/firebase.ts"
  "apps/frontend/src/pages/api/send-email.ts"
  "apps/frontend/src/services/api.ts"
  "apps/frontend/src/services/astrology.ts"
  "apps/frontend/src/services/calendarService.ts"
  "apps/frontend/src/services/chartService.ts"
  "apps/frontend/src/services/emailService.ts"
  "apps/frontend/src/services/errorLogger.ts"
  "apps/frontend/src/services/horoscopeService.ts"
  "apps/frontend/src/utils/batch-upload-utils.ts"
  "apps/frontend/src/utils/googleMaps.ts"
  "apps/frontend/src/utils/parsers.ts"
  "apps/frontend/src/utils/storage.ts"
  "apps/frontend/src/utils/testEmailFeature.ts"
  "scripts/generateMockPredictions.ts"
  "shared/api/predict.ts"
  "tests/basic.test.ts"
  "tests/createHoroscope.test.ts"
  "tests/horoscopeList.test.ts"
  "tests/predictionAccess.test.ts"
  "tests/publicPrediction.test.ts"
  "tests/support/commands.ts"
  "tests/testPrediction.test.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" "${file%.ts}.tsx"
    echo "Renamed $file → ${file%.ts}.tsx"
  else
    echo "Skipped (not found): $file"
  fi
done
