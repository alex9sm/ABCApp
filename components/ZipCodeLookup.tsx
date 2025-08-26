import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

interface Store {
  title: string
  address: string
  zip_code: string
  latitude: number
  longitude: number
  hours: string
  distance: number
}

interface ZipCodeLookupProps {
  onStoreSelected: (storeId: string) => void
  onStoresFound: (stores: Store[]) => void
}

const ZipCodeLookup: React.FC<ZipCodeLookupProps> = ({ onStoreSelected, onStoresFound }) => {
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
    try {
      const response = await fetch(`https://advancedgr.com/api/v1/stores/${zipCode}`)
      const result = await response.json()
      
      if (result.status === 'success' && result.data) {
        onStoresFound(result.data)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Zip Code</Text>
      <Text style={styles.subtitle}>Please enter your zip code to find ABC stores near you</Text>
      
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
    backgroundColor: '#012F47',
  },
  title: {
    marginTop: -60,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#D6D6D6',
    marginBottom: 30,
    marginHorizontal: 40,
    textAlign: 'center',
  },
  searchContainer: {
    width: '100%',
    paddingHorizontal: 30,
  },
  zipInput: {
    borderWidth: 2,
    borderColor: '#C4E7FB',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: '#001E2D',
    marginBottom: 20,
    letterSpacing: 2,
    color: '#fff',
  },
  searchButton: {
    backgroundColor: '#659CBB',
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