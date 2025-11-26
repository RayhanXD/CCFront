import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCalendarStore } from '@/store/calendar-store';
import Colors from '@/constants/colors';
import { XIcon as X, CheckIcon as Check } from '@/components/icons';
import { useTheme } from '@/contexts/theme-context';
import ThemedText from '@/components/ThemedText';
import { CALENDAR_IMAGE } from '@/constants/images';

export default function AddEventModal() {
  const addEvent = useCalendarStore((state) => state.addEvent);
  const isLoading = useCalendarStore((state) => state.isLoading);
  const storeError = useCalendarStore((state) => state.error);
  const { theme, isDarkMode } = useTheme();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [color, setColor] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  // Predefined colors for events
  const eventColors = [
    '#FF5733', // Red-Orange
    '#33FF57', // Green
    '#3357FF', // Blue
    '#FF33A8', // Pink
    '#33A8FF', // Light Blue
    '#A833FF', // Purple
    null,      // No color
  ];
  
  const handleSubmit = async () => {
    setLocalError(null);
    
    if (!title || !location || !duration) {
      setLocalError('Please fill in all required fields (Title, Location, Duration)');
      return;
    }

    const newEvent = {
      title,
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      duration: parseInt(duration),
      location,
      description,
      color: color || undefined,
      img: Image.resolveAssetSource(CALENDAR_IMAGE).uri // Use calendar image for all created events
    };

    console.log('📝 AddEventModal: Submitting event:', newEvent);

    try {
      await addEvent(newEvent);
      console.log('✅ AddEventModal: Event added successfully');
      router.back();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ AddEventModal: Failed to add event:', errorMsg);
      setLocalError(errorMsg);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <ThemedText variant="h3" weight="semibold" style={styles.headerTitle}>
          New Event
        </ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={theme.text} strokeWidth={isDarkMode ? 2.5 : 2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        {(localError || storeError) && (
          <View style={[styles.errorContainer, { backgroundColor: theme.error + '20', borderColor: theme.error }]}>
            <ThemedText variant="bodySmall" style={{ color: theme.error }}>
              {localError || storeError}
            </ThemedText>
          </View>
        )}
        
        <View style={styles.inputGroup}>
          <ThemedText variant="bodySmall" weight="medium" style={styles.label}>
            Title
          </ThemedText>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border,
                color: theme.text
              }
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Event title"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText variant="bodySmall" weight="medium" style={styles.label}>
            Date
          </ThemedText>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              style={{
                ...webStyles.dateInput,
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text
              }}
              value={date.toISOString().split('T')[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
            />
          ) : (
            <>
              <TouchableOpacity 
                style={[
                  styles.dateButton,
                  { 
                    backgroundColor: theme.inputBackground, 
                    borderColor: theme.border 
                  }
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText style={styles.dateButtonText}>
                  {date.toLocaleDateString()}
                </ThemedText>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  onChange={handleDateChange}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText variant="bodySmall" weight="medium" style={styles.label}>
            Time
          </ThemedText>
          {Platform.OS === 'web' ? (
            <input
              type="time"
              style={{
                ...webStyles.dateInput,
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text
              }}
              value={`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newDate = new Date(date);
                newDate.setHours(parseInt(hours));
                newDate.setMinutes(parseInt(minutes));
                setDate(newDate);
              }}
            />
          ) : (
            <>
              <TouchableOpacity 
                style={[
                  styles.dateButton,
                  { 
                    backgroundColor: theme.inputBackground, 
                    borderColor: theme.border 
                  }
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <ThemedText style={styles.dateButtonText}>
                  {date.toLocaleTimeString('en-US', { 
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true 
                  })}
                </ThemedText>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  onChange={handleTimeChange}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText variant="bodySmall" weight="medium" style={styles.label}>
            Duration (minutes)
          </ThemedText>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border,
                color: theme.text
              }
            ]}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="60"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText variant="bodySmall" weight="medium" style={styles.label}>
            Location
          </ThemedText>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border,
                color: theme.text
              }
            ]}
            value={location}
            onChangeText={setLocation}
            placeholder="Event location"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText variant="bodySmall" weight="medium" style={styles.label}>
            Description (optional)
          </ThemedText>
          <TextInput
            style={[
              styles.input, 
              styles.textArea,
              { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border,
                color: theme.text
              }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add description"
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText variant="bodySmall" weight="medium" style={styles.label}>
            Event Color (optional)
          </ThemedText>
          <View style={styles.colorPicker}>
            {eventColors.map((eventColor, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorOption,
                  eventColor ? { backgroundColor: eventColor } : [styles.noColorOption, { backgroundColor: theme.cardBackground, borderColor: theme.border }],
                  color === eventColor && [styles.selectedColorOption, { borderColor: theme.white }]
                ]}
                onPress={() => setColor(eventColor)}
              >
                {color === eventColor && (
                  <View style={styles.colorCheckmark}>
                    <Check size={12} color="#FFF" strokeWidth={isDarkMode ? 2.5 : 2} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            { backgroundColor: theme.primary },
            isLoading && [styles.disabledButton, { backgroundColor: theme.primary + '80' }]
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <ThemedText variant="button" color="inverted" style={styles.submitButtonText}>
            {isLoading ? 'Creating...' : 'Create Event'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noColorOption: {
    borderWidth: 1,
  },
  selectedColorOption: {
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  colorCheckmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButton: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  dateButtonText: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.8,
  },
});

// Web styles are applied dynamically with theme colors in the component
const webStyles = {
  dateInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: '100%',
    outline: 'none',
  },
}