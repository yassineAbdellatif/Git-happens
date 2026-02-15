import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    backgroundColor: '#5D2026', 
    height: 100, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15 
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  monthSelector: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  monthText: { fontSize: 18, color: '#5D2026', marginHorizontal: 10 },
  dateHeader: { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderColor: '#DDD', paddingBottom: 10 },
  dayColumn: { alignItems: 'center' },
  dayNumber: { fontSize: 18, color: '#666' },
  activeDay: { color: '#4A90E2', fontWeight: 'bold' },
  dayName: { fontSize: 12, color: '#999' },
  gridScroll: { paddingBottom: 100 },
  gridContainer: { flexDirection: 'row' },
  timeLabels: { width: 50, paddingLeft: 10 },
  timeLabelText: { height: 60, fontSize: 12, color: '#AAA' },
  eventGrid: { flex: 1, borderLeftWidth: 1, borderColor: '#EEE' },
  eventBlock: { 
    position: 'absolute', 
    backgroundColor: '#5D2026', 
    width: '12%', 
    borderRadius: 4, 
    padding: 5,
    justifyContent: 'center'
  },
  eventText: { color: 'white', fontSize: 10, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 30, right: 30 }
});