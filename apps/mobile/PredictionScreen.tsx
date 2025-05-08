import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { getPrediction } from './prediction';
import { PredictionInput, PredictionResult } from '@shared/types/prediction';

const PredictionScreen = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGetPrediction = async () => {
    setLoading(true);
    const prediction = await getPrediction(/* pass user data here */);
    setResult(prediction?.result || 'No prediction');
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Fetch Prediction" onPress={handleGetPrediction} />
      {loading && <ActivityIndicator />}
      {result && <Text style={{ marginTop: 20 }}>{result}</Text>}
    </View>
  );
};

export default PredictionScreen;
