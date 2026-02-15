import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { styles } from '../styles/calendarScreenStyle';

const CalendarScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Class Schedule</Text>
        <View style={{ width: 30 }} /> {/* Spacer for centering */}
      </View>

      {/* 2. Month Selector */}
      <View style={styles.monthSelector}>
        <Ionicons name="calendar-outline" size={24} color="#5D2026" />
        <Text style={styles.monthText}>February</Text>
        <Ionicons name="caret-down" size={16} color="#5D2026" />
      </View>

      {/* 3. Date Header (22 - 28) */}
      <View style={styles.dateHeader}>
        {/* We would map through the current week's dates here */}
        {['22', '23', '24', '25', '26', '27', '28'].map((day, index) => (
          <View key={index} style={styles.dayColumn}>
            <Text style={[styles.dayNumber, day === '24' && styles.activeDay]}>{day}</Text>
            <Text style={styles.dayName}>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}</Text>
          </View>
        ))}
      </View>

      {/* 4. Time Grid Area */}
      <ScrollView contentContainerStyle={styles.gridScroll}>
        <View style={styles.gridContainer}>
          {/* Time Labels (9am, 1pm, etc.) */}
          <View style={styles.timeLabels}>
            {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
              <Text key={t} style={styles.timeLabelText}>{t} pm</Text>
            ))}
          </View>

          {/* This is where the Calendar Events would be mapped as absolute Views */}
          <View style={styles.eventGrid}>
            {/* Example: SOEN 345 LAB block */}
            <View style={[styles.eventBlock, { top: 350, left: '14%', height: 120 }]}>
              <Text style={styles.eventText}>SOEN 345{"\n"}LAB</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 5. Next Week Button (FAB) */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="arrow-forward-circle" size={60} color="#5D2026" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};



export default CalendarScreen;