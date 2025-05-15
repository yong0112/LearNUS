import { StyleSheet, Text, View } from 'react-native'

export default function Chat() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  header: {
    fontSize: 30,
    fontWeight: '600',
  }
})