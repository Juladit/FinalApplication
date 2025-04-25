import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SetBudgetScreen = () => {
  const [budget, setBudget] = useState('');

  useEffect(() => {
    const loadBudget = async () => {
      const stored = await AsyncStorage.getItem('budget');
      if (stored) setBudget(stored);
    };
    loadBudget();
  }, []);

  const saveBudget = async () => {
    await AsyncStorage.setItem('budget', budget);
    alert('Budget saved!');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Set Monthly Budget</Text>
      <TextInput
        keyboardType="numeric"
        value={budget}
        onChangeText={setBudget}
        placeholder="Enter amount"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />
      <Button title="Save Budget" onPress={saveBudget} />
    </View>
  );
};

export default SetBudgetScreen;
