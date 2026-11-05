import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { apiService } from '../services/api';

const APITestScreen: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to test');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    console.log(message);
  };

  const testConnection = async () => {
    setLogs([]);
    setStatus('Testing...');
    addLog('🧪 Starting API Connection Test\n');

    try {
      // Test 1: Register
      addLog('1️⃣ Testing Registration...');
      const registerResponse = await apiService.post('/auth/register', {
        name: 'API Test User',
        email: `apitest${Date.now()}@test.com`,
        password: 'test123'
      });
      addLog(`✅ Registration successful`);
      addLog(`   User: ${registerResponse.user.name}`);
      addLog(`   Token: ${registerResponse.token ? 'Generated' : 'Missing'}`);

      const token = registerResponse.token;
      apiService.setToken(token);

      // Test 2: Login
      addLog('\n2️⃣ Testing Login...');
      const loginResponse = await apiService.post('/auth/login', {
        email: registerResponse.user.email,
        password: 'test123'
      });
      addLog(`✅ Login successful`);
      addLog(`   User: ${loginResponse.user.name}`);
      addLog(`   Handle: ${loginResponse.user.handle}`);

      // Test 3: Protected Route
      addLog('\n3️⃣ Testing Protected Route...');
      const meResponse = await apiService.get('/auth/me');
      addLog(`✅ Protected route successful`);
      addLog(`   Name: ${meResponse.user.name}`);
      addLog(`   Reading Stats: ${JSON.stringify(meResponse.user.readingStats)}`);

      // Test 4: Get Books (Empty)
      addLog('\n4️⃣ Testing Get Books (Empty)...');
      const getBooksEmptyResponse = await apiService.get('/books');
      addLog(`✅ Get books successful`);
      addLog(`   Books Count: ${getBooksEmptyResponse.count}`);

      // Test 5: Create Book
      addLog('\n5️⃣ Testing Create Book...');
      const createBookResponse = await apiService.post('/books', {
        title: 'API Test Book',
        author: 'Test Author',
        category: 'Fiction',
        description: 'A test book created via API'
      });
      addLog(`✅ Create book successful`);
      addLog(`   Book: ${createBookResponse.book.title}`);
      addLog(`   ID: ${createBookResponse.book.id}`);

      // Test 6: Get Books (With Data)
      addLog('\n6️⃣ Testing Get Books (With Data)...');
      const getBooksWithDataResponse = await apiService.get('/books');
      addLog(`✅ Get books successful`);
      addLog(`   Books Count: ${getBooksWithDataResponse.count}`);
      addLog(`   Book: ${getBooksWithDataResponse.books[0]?.title}`);

      setStatus('✅ All tests passed!');
      addLog('\n🎉 Frontend-Backend integration is working!');

    } catch (error) {
      setStatus('❌ Test failed');
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      Alert.alert('Test Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Connection Test</Text>
        <Text style={styles.subtitle}>Test frontend-backend integration</Text>
      </View>

      <TouchableOpacity style={styles.testButton} onPress={testConnection}>
        <Text style={styles.testButtonText}>Run Connection Test</Text>
      </TouchableOpacity>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.statusText, { color: status.includes('✅') ? '#4CAF50' : status.includes('❌') ? '#F44336' : '#2196F3' }]}>
          {status}
        </Text>
      </View>

      <ScrollView style={styles.logContainer}>
        <Text style={styles.logTitle}>Test Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  logText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});

export default APITestScreen;