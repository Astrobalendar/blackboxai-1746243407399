import React from 'react';
import { PredictionInput, PredictionResult } from '@shared/types/prediction';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>AstroBalendar</Text>
      <Button title="Get Prediction" onPress={() => navigation.navigate('Prediction')} />
    </View>
  );
};

export default HomeScreen;
