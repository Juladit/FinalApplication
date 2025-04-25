import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, FAB, Avatar, useTheme, Menu, Divider, Appbar, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';

const HomeScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [menuVisible, setMenuVisible] = useState(false);
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });
  const theme = useTheme();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions();
    });
    return unsubscribe;
  }, [navigation]);

  const loadTransactions = async () => {
    try {
      const stored = await AsyncStorage.getItem('transactions');
      console.log('Loaded transactions from AsyncStorage:', stored); // Debugging: Check what data is loaded
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed transactions:', parsed); // Debugging: Check parsed transactions
        setTransactions(parsed);
        setFilteredTransactions(parsed);
        calculateTotals(parsed);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const calculateTotals = (transactions) => {
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      const amount = parseFloat(t.amount) || 0;
      if (t.type === 'income') {
        income += amount;
      } else {
        expense += amount;
      }
    });

    setTotals({
      income,
      expense,
      balance: income - expense
    });
  };

  useEffect(() => {
    console.log('Transactions:', transactions);  // Debugging: Check if transactions are being loaded
    filterTransactions();
  }, [filterType, sortBy, transactions]);
  
  const filterTransactions = () => {
    let filtered = [...transactions];

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (sortBy === 'date') {
      filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'amount') {
      filtered = filtered.sort((a, b) => b.amount - a.amount);
    }

    setFilteredTransactions(filtered);
    calculateTotals(filtered);
  };

  const groupByMonth = () => {
    const grouped = filteredTransactions.reduce((groups, transaction) => {
      const month = new Date(transaction.date).toLocaleString('th-TH', { 
        month: 'long', 
        year: 'numeric' 
      });
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(transaction);
      return groups;
    }, {});
    
    console.log('Grouped by Month:', grouped);  // Debugging: Check grouped transactions by month
    return grouped;
  };

  const renderRightActions = (item) => {
    return (
      <View style={styles.rightActions}>
        <Text style={styles.actionText} onPress={() => editTransaction(item)}>
          แก้ไข
        </Text>
        <Text style={styles.actionText} onPress={() => deleteTransaction(item)}>
          ลบ
        </Text>
      </View>
    );
  };

  const renderTransactionItem = (item) => {
    const isIncome = item.type === 'income';
    const amountColor = isIncome ? '#4CAF50' : '#F44336';
    const amount = parseFloat(item.amount) || 0;
    const formattedAmount = `${isIncome ? '+' : '-'}฿${amount.toLocaleString('th-TH', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
    const formattedDate = new Date(item.date).toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric',
    });

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <View style={styles.listItem}>
          <Avatar.Icon
            size={36}
            icon={isIncome ? 'cash-plus' : 'cash-minus'}
            style={{ backgroundColor: isIncome ? '#4CAF50' : '#F44336' }}
          />
          <View style={styles.textContainer}>
            <Text style={styles.categoryText}>{item.category}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
            {item.note && <Text style={styles.noteText}>{item.note}</Text>}
          </View>
          <Text style={[styles.amountText, { color: amountColor }]}>
            {formattedAmount}
          </Text>
        </View>
      </Swipeable>
    );
  };

  const editTransaction = (transaction) => {
    navigation.navigate('Add', { transaction });
  };

  const deleteTransaction = async (transaction) => {
    Alert.alert(
      'ลบรายการ',
      'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?',
      [
        { text: 'ยกเลิก' },
        {
          text: 'ลบ',
          onPress: async () => {
            try {
              const updatedTransactions = transactions.filter(t => t.date !== transaction.date);
              await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
              setTransactions(updatedTransactions);
              setFilteredTransactions(updatedTransactions);
              calculateTotals(updatedTransactions);
            } catch (error) {
              console.error('Error deleting transaction:', error);
              alert('เกิดข้อผิดพลาดในการลบรายการ');
            }
          }
        }
      ]
    );
  };

   return (
    <View style={[styles.container, { backgroundColor: 'white' }]}>
      <Appbar.Header>
        <Appbar.Content title="รายการธุรกรรม" />
        <Appbar.Action 
          icon="chart-pie" 
          onPress={() => navigation.navigate('PieChart')} 
        />
        <Appbar.Action 
          icon="filter" 
          onPress={() => setMenuVisible(true)} 
        />
      </Appbar.Header>

      {filteredTransactions.length === 0 ? (
        <Text style={{ color: 'white', textAlign: 'center' }}>ไม่มีรายการที่ตรงกับตัวกรอง</Text>
      ) : (
        <FlatList
          data={Object.entries(groupByMonth())}
          keyExtractor={([month]) => month}
          renderItem={({ item: [month, transactions] }) => (
            <View>
              <Text style={styles.monthHeader}>{month}</Text>
              {transactions.map((transaction, index) => (
                <View key={`${transaction.date}-${index}`}>
                  {renderTransactionItem(transaction)}
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        label="เพิ่มรายการใหม่"
        onPress={() => navigation.navigate('Add')}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  summaryCard: {
    margin: 16,
    backgroundColor: 'yellow',
  },
  noteText: {
    fontSize: 14,
    color: 'black',
    marginTop: 4,
    fontStyle: 'italic',
  },  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  incomeText: {
    color: 'green',
    fontWeight: 'bold',
  },
  expenseText: {
    color: 'red',
    fontWeight: 'bold',
  },
  balanceText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: 'Black',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    paddingVertical: 8,
  },
  listContent: {
    paddingBottom: 80,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  categoryText: {
    fontSize: 16,
    color: '#black',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#gray',
    marginTop: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 160,
  },
  actionText: {
    color: 'black',
    padding: 20,
    backgroundColor: '#333',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

export default HomeScreen;