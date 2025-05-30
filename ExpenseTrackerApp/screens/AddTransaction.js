import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, Text, RadioButton, Menu, Divider, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const incomeCategories = ['เงินเดือน', 'ลงทุน', 'ของขวัญ', 'อื่นๆ'];
const expenseCategories = ['อาหาร', 'เดินทาง', 'ช้อปปิ้ง', 'ค่าสาธารณูปโภค', 'อื่นๆ'];

const AddTransaction = ({ navigation, route }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [note, setNote] = useState('');

  // Load transaction data if editing
  React.useEffect(() => {
    if (route.params?.transaction) {
      const { amount, type, category, note } = route.params.transaction;
      setAmount(amount.toString());
      setType(type);
      setCategory(category);
      setNote(note || '');
    }
  }, [route.params?.transaction]);
  
  const theme = {
    colors: {
      primary: '#4CAF50', // for active color (green)
      text: '#000000',     // force black text
      placeholder: '#000000', // dark gray placeholder
      background: '#ffffff',
    }
  };

  const saveTransaction = async () => {
    if (!amount || !category) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
      alert('กรุณากรอกจำนวนเงินที่ถูกต้อง');
      return;
    }

    const newTransaction = {
      amount: amountValue,
      type,
      category,
      note,
      date: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(await AsyncStorage.getItem('transactions')) || [];
      
      if (route.params?.transaction) {
        // Update existing transaction
        const updated = existing.map(t => 
          t.date === route.params.transaction.date && 
          t.amount === route.params.transaction.amount ? newTransaction : t
        );
        await AsyncStorage.setItem('transactions', JSON.stringify(updated));
      } else {
        // Add new transaction
        await AsyncStorage.setItem('transactions', JSON.stringify([newTransaction, ...existing]));
      }
      
      navigation.goBack();
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      console.error(error);
    }
  };

  const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{route.params?.transaction ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</Text>

      <TextInput
  label="จำนวนเงิน (฿)"
  value={amount}
  onChangeText={setAmount}
  keyboardType="numeric"
  style={styles.input}
  left={<TextInput.Affix text="฿" />}
  theme={theme}
/>

<TextInput
  label="หมายเหตุ (ไม่จำเป็น)"
  value={note}
  onChangeText={setNote}
  style={styles.input}
  theme={theme}
/>

<View style={styles.radioGroup}>
  <Text style={{ color: '#000' }}>ประเภท:</Text>
  <RadioButton.Group onValueChange={value => setType(value)} value={type}>
    <View style={styles.radioOption}>
      <RadioButton value="income" color="#4CAF50" />
      <Text style={{ color: '#000' }}>รายรับ</Text>
    </View>
    <View style={styles.radioOption}>
      <RadioButton value="expense" color="#4CAF50" />
      <Text style={{ color: '#000' }}>รายจ่าย</Text>
    </View>
  </RadioButton.Group>
</View>

      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
  <Menu
    visible={menuVisible}
    onDismiss={() => setMenuVisible(false)} 
    anchor={
      <Button 
        mode="outlined" 
        onPress={() => setMenuVisible(true)} 
        style={styles.menuButton}
        color="#4CAF50" 
        labelStyle={{ color: '#000' }} 
        icon="menu-down" 
        iconColor="#4CAF50" 
        iconStyle={{ color: '#000' }} 
      >
        {category || 'เลือกหมวดหมู่'}
      </Button>
    }
  >
    {currentCategories.map((cat, i) => (
      <Menu.Item
        key={i}
        onPress={() => {
          setCategory(cat);
          setMenuVisible(false);
        }}
        title={cat}
      />
    ))}
  </Menu>
</View>


      <Divider style={{ marginVertical: 10 }} />

      <Button 
        mode="contained" 
        onPress={saveTransaction}
        style={styles.saveButton}
      >
        บันทึก
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#555',
    color: '#000',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  menuButton: {
    marginBottom: 20,
    borderColor: '#555',
  },
  saveButton: {
    marginTop: 10,
    paddingVertical: 5,
    backgroundColor: '#4CAF50',
  },
});

export default AddTransaction;