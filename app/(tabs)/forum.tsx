import { StyleSheet, Text, View } from 'react-native'

export default function Chat() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Forum</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  header: {
    fontSize: 30,
    fontWeight: '600',
  }
})