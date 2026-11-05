import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBooks } from '../context/BookContext';
import * as DocumentPicker from '@react-native-documents/picker';

const UploadBookScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { uploadBook } = useBooks();

  const [file, setFile] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.plainText],
      });

      // DocumentPicker returns an array
      const selectedFile = Array.isArray(result) ? result[0] : result;
      setFile(selectedFile);
      if (!title && selectedFile.name) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      if (err?.code === 'DocumentPicker.isCancel') {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    if (!title || !author) {
      Alert.alert('Error', 'Please fill in title and author');
      return;
    }

    setLoading(true);

    try {
      console.log('Starting upload...', { fileName: file.name, fileType: file.type, fileUri: file.uri });

      const result = await uploadBook(
        {
          uri: file.uri,
          name: file.name,
          type: file.type || 'application/pdf',
        },
        {
          title,
          author,
          category: category || 'Uncategorized',
          description,
        }
      );

      console.log('Upload successful:', result);

      Alert.alert('Success', 'Book uploaded successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', `Failed to upload book: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Upload Your Book</Text>
        <Text style={styles.subtitle}>Add your own PDF or TXT files to your library</Text>
      </View>

      <TouchableOpacity style={styles.filePicker} onPress={pickDocument}>
        <View style={styles.filePickerContent}>
          <View style={styles.fileIcon}>
            <Text style={styles.fileIconText}>{file ? '📄' : '📁'}</Text>
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.filePickerText}>
              {file ? file.name : 'Select File'}
            </Text>
            <Text style={styles.filePickerSubtext}>
              {file ? 'File selected' : 'PDF or TXT files only'}
            </Text>
          </View>
          <Text style={styles.filePickerArrow}>→</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.formCard}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter book title"
            placeholderTextColor="#9AA5B8"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Author *</Text>
          <TextInput
            style={styles.input}
            value={author}
            onChangeText={setAuthor}
            placeholder="Enter author name"
            placeholderTextColor="#9AA5B8"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., Fiction, Non-fiction"
            placeholderTextColor="#9AA5B8"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description for your book"
            placeholderTextColor="#9AA5B8"
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
        onPress={handleUpload}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        ) : (
          <Text style={styles.uploadButtonText}>Upload Book</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  contentContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10213D',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#50617D',
    lineHeight: 22,
  },
  filePicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E4E8F0',
    overflow: 'hidden',
  },
  filePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  fileIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  fileIconText: {
    fontSize: 28,
  },
  fileInfo: {
    flex: 1,
  },
  filePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10213D',
    marginBottom: 4,
  },
  filePickerSubtext: {
    fontSize: 14,
    color: '#50617D',
  },
  filePickerArrow: {
    fontSize: 20,
    color: '#A38BFA',
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    color: '#50617D',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E4E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FBFCFF',
    color: '#10213D',
  },
  textArea: {
    height: 120,
    minHeight: 120,
  },
  uploadButton: {
    backgroundColor: '#68D8B0',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#68D8B0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  uploadButtonDisabled: {
    backgroundColor: '#CBD3E1',
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  uploadButtonText: {
    color: '#10213D',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#10213D',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#50617D',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UploadBookScreen;
