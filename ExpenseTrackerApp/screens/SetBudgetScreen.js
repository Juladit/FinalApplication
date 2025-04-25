import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SetBudgetScreen = () => {
  const [budget, setBudget] = useState('');

  useEffect(() => {
    const loadTransactions = async () => {
      const stored = await AsyncStorage.getItem('transactions');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(parsed); // Check if data is fetched properly
        setTransactions(parsed);
        setFilteredTransactions(parsed);
        calculateTotals(parsed);
      } else {
        console.log('No transactions found'); // If no data is available
      }
    };
    loadTransactions();
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
