// screens/SummaryScreen.js
import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const SummaryScreen = () => {
  const [data, setData] = useState([]);

  const loadSummary = async () => {
    const transactions = JSON.parse(await AsyncStorage.getItem('transactions')) || [];
    const totals = {};

    transactions.forEach((t) => {
      if (t.type === 'expense') {
        totals[t.category] = (totals[t.category] || 0) + parseFloat(t.amount);
      }
    });

    const chartData = Object.keys(totals).map((key, i) => ({
      name: key,
      amount: totals[key],
      color: ['#f00', '#0f0', '#00f', '#ff0'][i % 4],
      legendFontColor: '#fff',
      legendFontSize: 12,
    }));

    setData(chartData);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <View>
      <PieChart
        data={data}
        width={screenWidth}
        height={220}
        chartConfig={{ backgroundGradientFrom: '#1E2923', backgroundGradientTo: '#08130D', color: () => `#fff` }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
      />
    </View>
  );
};

export default SummaryScreen;
