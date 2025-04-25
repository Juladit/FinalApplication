import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import AddTransaction from './screens/AddTransaction';
import PieChartScreen from './screens/PieChartScreen';
import SetBudgetScreen from './screens/SetBudgetScreen';

const Stack = createStackNavigator();



export default function App() {
  return (
    <NavigationContainer debug={true}> {/* Add debug={true} here */}
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Add" component={AddTransaction} />
        <Stack.Screen name="PieChart" component={PieChartScreen} />
        <Stack.Screen name="SetBudget" component={SetBudgetScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
