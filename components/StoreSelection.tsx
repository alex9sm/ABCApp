import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface Store {
  title: string
  address: string
  zip_code: string
  latitude: number
  longitude: number
  hours: string
  distance: number
}

interface StoreSelectionProps {
  stores: Store[]
  onStoreSelected: (storeId: string) => void
  onGoBack: () => void
}

const StoreSelection: React.FC<StoreSelectionProps> = ({ stores, onStoreSelected, onGoBack }) => {
  const formatDistance = (distanceInMeters: number) => {
    const distanceInMiles = distanceInMeters * 0.000621371
    return `${distanceInMiles.toFixed(1)} mi`
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Your Home Store</Text>
        <Text style={styles.subtitle}>{stores.length} stores found near you</Text>
      </View>
      
      <ScrollView style={styles.storeList} showsVerticalScrollIndicator={false}>
        {stores.map((store, index) => (
          <TouchableOpacity
            key={`${store.title}-${index}`}
            style={styles.storeCard}
            onPress={() => onStoreSelected(store.title)}
          >
            <View style={styles.storeHeader}>
              <Text style={styles.storeTitle}>Store #{store.title}</Text>
              <Text style={styles.storeDistance}>{formatDistance(store.distance)}</Text>
            </View>
            
            <Text style={styles.storeAddress}>{store.address}</Text>
            <Text style={styles.storeZip}>{store.zip_code}</Text>
            
            <View style={styles.storeHours}>
              <Text style={styles.hoursLabel}>Hours:</Text>
              <Text style={styles.hoursText}>{store.hours}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#012F47',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#012F47',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#C4E7FB',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#D6D6D6',
  },
  storeList: {
    flex: 1,
    padding: 20,
  },
  storeCard: {
    backgroundColor: '#001E2D',
    borderWidth: 2,
    borderColor: '#C4E7FB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  storeDistance: {
    fontSize: 16,
    color: '#C4E7FB',
    fontWeight: '600',
  },
  storeAddress: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  storeZip: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
  },
  storeHours: {
    backgroundColor: '#012F47',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  hoursLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  hoursText: {
    fontSize: 14,
    color: '#fff',
  },
})

export default StoreSelection