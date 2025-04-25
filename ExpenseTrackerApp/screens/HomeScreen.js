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
  const [totals, setTotals] = useState({ 
    income: 0, 
    expense: 0, 
    balance: 0 
  });
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
      if (stored) {
        const parsed = JSON.parse(stored);
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

  useEffect(() => {
    filterTransactions();
  }, [filterType, sortBy, transactions]);

  const groupByMonth = () => {
    return filteredTransactions.reduce((groups, transaction) => {
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
            {item.note && <Text style={styles.noteText}>{item.note}</Text>}  {/* Display the note */}
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
              console.log('Deleting transaction:', transaction);  // Debugging
              const updatedTransactions = transactions.filter(
                t => t.date !== transaction.date
              );
    
              // Save the updated transactions back to AsyncStorage
              await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    
              // Update the state to reflect the changes in the UI
              setTransactions(updatedTransactions);
              setFilteredTransactions(updatedTransactions);
    
              // Recalculate totals after deletion
              calculateTotals(updatedTransactions);
    
              // Display the updated AsyncStorage data in an alert
              const storedTransactions = await AsyncStorage.getItem('transactions');
              Alert.alert('AsyncStorage after delete', JSON.stringify(JSON.parse(storedTransactions), null, 2));
    
              console.log('Transaction deleted successfully');
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
      >
        <Menu.Item 
          onPress={() => { setFilterType('all'); setMenuVisible(false); }} 
          title="ทั้งหมด" 
        />
        <Menu.Item 
          onPress={() => { setFilterType('income'); setMenuVisible(false); }} 
          title="รายรับ" 
        />
        <Menu.Item 
          onPress={() => { setFilterType('expense'); setMenuVisible(false); }} 
          title="รายจ่าย" 
        />
        <Divider />
        <Menu.Item 
          onPress={() => { setSortBy('date'); setMenuVisible(false); }} 
          title="เรียงตามวันที่" 
        />
        <Menu.Item 
          onPress={() => { setSortBy('amount'); setMenuVisible(false); }} 
          title="เรียงตามจำนวนเงิน" 
        />
      </Menu>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryRow}>
            <Text>รายรับ:</Text>
            <Text style={styles.incomeText}>
              ฿{totals.income.toLocaleString('th-TH', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>รายจ่าย:</Text>
            <Text style={styles.expenseText}>
              ฿{totals.expense.toLocaleString('th-TH', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>ยอดคงเหลือ:</Text>
            <Text style={[
              styles.balanceText,
              { color: totals.balance >= 0 ? '#4CAF50' : '#F44336' }
            ]}>
              ฿{totals.balance.toLocaleString('th-TH', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </Text>
          </View>
        </Card.Content>
      </Card>

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
    backgroundColor: '#1E1E1E',
  },
  noteText: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
    fontStyle: 'italic',
  },  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  incomeText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  expenseText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  balanceText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1E1E1E',
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
    color: '#fff',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#aaa',
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
    color: '#fff',
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