import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function MenuScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Menu Screen</Text>
      <Text style={styles.subtext}>Coming Soon...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
})