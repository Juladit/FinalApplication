import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const PieChartScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const theme = useTheme();

  const loadSummary = async () => {
    const transactions = JSON.parse(await AsyncStorage.getItem('transactions')) || [];
    const totals = {};

    transactions.forEach((t) => {
      if (t.type === 'expense') {
        totals[t.category] = (totals[t.category] || 0) + parseFloat(t.amount);
      }
    });

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#8AC24A', '#607D8B'
    ];

    const chartData = Object.keys(totals).map((key, i) => ({
      name: key,
      amount: totals[key],
      color: colors[i % colors.length], // Assign a color to each category
      legendFontColor: theme.colors.text, // Use the theme text color for legends
      legendFontSize: 12,
    }));

    setData(chartData);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <Card style={{ margin: 16 }}>
        <Card.Content>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          marginBottom: 16,
          color: theme.colors.primary // or any other color
          }}>
            Expense Breakdown
          </Text>
          {data.length > 0 ? (
            <PieChart
              data={data}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundColor: '#555',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => theme.colors.text,  // Replace with any color code you like
                labelColor: (opacity = 1) => theme.colors.text,  // Replace with any color code you like
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <Text>No expense data available</Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );
  
};


export default PieChartScreen;
