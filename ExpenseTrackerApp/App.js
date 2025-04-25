import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import AddTransaction from './screens/AddTransaction';
import PieChartScreen from './screens/PieChartScreen';
import SetBudgetScreen from './screens/SetBudgetScreen';
import { PaperProvider, DarkTheme as PaperDark, DefaultTheme as PaperLight } from 'react-native-paper';
import { useColorScheme } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? PaperDark : PaperLight;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Add" component={AddTransaction} />
          <Stack.Screen name="PieChart" component={PieChartScreen} />
          <Stack.Screen name="SetBudget" component={SetBudgetScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}