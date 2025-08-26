import { StyleSheet, Text, View } from 'react-native'

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
    backgroundColor: '#012F47',
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#fff',
  },
})