import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#912338', justifyContent: 'center', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: 'white',
    width: '40%',
    aspectRatio: 1,
    margin: 15,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  label: { marginTop: 10, fontSize: 16, color: '#333', fontWeight: '500' }
});