import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

interface ZipCodeLookupProps {
  onStoreSelected: (storeId: string) => void
}

const ZipCodeLookup: React.FC<ZipCodeLookupProps> = ({ onStoreSelected }) => {
  const [zipCode, setZipCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleZipCodeChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '')
    if (numericText.length <= 5) {
      setZipCode(numericText)
    }
  }

  const handleSearch = async () => {
    if (zipCode.length !== 5) return
    
    setIsLoading(true)
    // TODO: Implement store search logic
    console.log('Searching for stores near:', zipCode)
    setIsLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Zip Code</Text>
      <Text style={styles.subtitle}>Please enter your zip code so we can find ABC stores near you</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.zipInput}
          value={zipCode}
          onChangeText={handleZipCodeChange}
          placeholder="12345"
          keyboardType="numeric"
          maxLength={5}
          autoFocus={true}
        />
        <TouchableOpacity
          style={[styles.searchButton, zipCode.length !== 5 && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={zipCode.length !== 5 || isLoading}
        >
          <Text style={[styles.searchButtonText, zipCode.length !== 5 && styles.searchButtonTextDisabled]}>
            {isLoading ? 'Searching...' : 'Search Stores'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    marginHorizontal: 30,
    textAlign: 'center',
  },
  searchContainer: {
    width: '100%',
    paddingHorizontal: 30,
  },
  zipInput: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: '#fff',
    marginBottom: 20,
    letterSpacing: 2,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchButtonTextDisabled: {
    color: '#999',
  },
})

export default ZipCodeLookup