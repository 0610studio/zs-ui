import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import ThemeExample from './pages/ThemeExample';
import LayoutExample from './pages/LayoutExample';
import NotifyExample from './pages/NotifyExample';
import { useTheme } from 'zs-ui';

const BUTTONS = [
  { id: 'Theme', title: 'Theme Example', component: <ThemeExample /> },
  { id: 'Layout', title: 'Layout Example', component: <LayoutExample /> },
  { id: 'Notify', title: 'Notify Example', component: <NotifyExample /> },
];

export default function NavigateComponent() {
  const { palette: { toggleTheme, mode } } = useTheme();
  const [currentPage, setCurrentPage] = useState('Theme');

  const renderPage = () => {
    const selected = BUTTONS.find(button => button.id === currentPage);
    return selected ? selected.component : <ThemeExample />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 버튼 그룹 */}
      <View style={styles.buttonContainer}>
        <ScrollView horizontal={true} style={{ width: '100%' }} contentContainerStyle={{ paddingVertical: 15, paddingHorizontal: 10, gap: 10 }}>

          {/* 테마 토글 버튼 */}
          <Pressable onPress={toggleTheme} style={[styles.button, { backgroundColor: 'orange' }]}>
            <Text style={styles.buttonText}>현재 모드: {mode}</Text>
          </Pressable>

          {BUTTONS.map(button => (
            <TouchableOpacity
              key={button.id}
              style={[
                styles.button,
                currentPage === button.id && styles.buttonSelected,
              ]}
              onPress={() => setCurrentPage(button.id)}
            >
              <Text
                style={[
                  styles.buttonText,
                  currentPage === button.id && styles.buttonTextSelected,
                ]}
              >
                {button.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 선택된 페이지 표시 */}
      <View style={styles.pageContainer}>
        {renderPage()}
      </View>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: '#00000022',
  },
  modeButton: {
    padding: 8,
    borderRadius: 25,
    backgroundColor: '#000000cc',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    top: 70
  },
  button: {
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#BB86FC',
    alignItems: 'center',
    paddingHorizontal:10
  },
  buttonSelected: {
    backgroundColor: '#3700B3',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonTextSelected: {
    color: '#FFEB3B',
  },
  pageContainer: {
    flex: 1,
    padding: 0,
  },
});
