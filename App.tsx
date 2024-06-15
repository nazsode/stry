import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, Dimensions, Image, TextInput } from 'react-native';
import { fetchWeatherData } from './backend.js'; // Backend'den verileri almak için kullanılan fonksiyon

// Hava durumu verilerinin türü
interface WeatherData {
  result: DayData[];
}

// Her bir günün verilerinin türü
interface DayData {
  date: string;
  day: string;
  degree: string;
  min: string;
  max: string;
  description: string;
}

// WeatherComponent için prop türleri
interface WeatherComponentProps {
  weatherData: WeatherData | null;
  searchText: string;
  setSearchText: (text: string) => void;
  handleSearchSubmit: () => void;
}

// Gün isimlerinin çevirisi
const translateDay = (day: string) => {
  const dayTranslations: { [key: string]: string } = {
    'Pazartesi': 'Monday',
    'Salı': 'Tuesday',
    'Çarşamba': 'Wednesday',
    'Perşembe': 'Thursday',
    'Cuma': 'Friday',
    'Cumartesi': 'Saturday',
    'Pazar': 'Sunday'
  };
  return dayTranslations[day] || day;
};

// Hava durumu açıklamalarının çevirisi
const translateDescription = (description: string) => {
  if (description.includes('açık')) return 'Clear';
  if (description.includes('hafif yağmur')) return 'Light Rain';
  if (description.includes('az bulutlu')) return 'Partly Cloudy';
  if (description.includes('kapalı')) return 'Overcast';
  return 'Clear';
};

// WeatherComponent bileşeni
const WeatherComponent: React.FC<WeatherComponentProps> = ({ weatherData, searchText, setSearchText, handleSearchSubmit }) => {
  const currentDayData = weatherData?.result ? weatherData.result[0] : null;
  let weatherIcon = require('./assets/sunny.png');
  let background = require('./assets/sunnybackground.jpg');

  if (currentDayData) {
    if (currentDayData.description.includes('açık')) {
      weatherIcon = require('./assets/sunny.png');
      background = require('./assets/sunnybackground.jpg');
    } else if (currentDayData.description.includes('hafif yağmur')) {
      weatherIcon = require('./assets/rainy.png');
      background = require('./assets/rainybackground.jpg');
    } else if (currentDayData.description.includes('az bulutlu')) {
      weatherIcon = require('./assets/cloudy.png');
      background = require('./assets/cloudybackground.jpg');
    } else if (currentDayData.description.includes('kapalı')) {
      weatherIcon = require('./assets/foggy.png');
      background = require('./assets/foggybackground.jpg');
    }
  }

  return (
    <ImageBackground
      source={background}
      style={styles.background}
      imageStyle={{ backgroundColor: 'rgba(0, 0, 0,0.8)' }}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearchSubmit}
        />
        <Text style={styles.title}>Weather in {searchText}</Text>
        {currentDayData && weatherIcon && (
          <Image source={weatherIcon} style={styles.weatherIcon} />
        )}
        {weatherData ? (
          <>
            {currentDayData && (
              <View style={styles.currentDayContainer}>
                <View style={styles.infoContainer}>
                  <Text style={styles.text}>Day</Text>
                  <Text style={styles.value}>{translateDay(currentDayData.day)}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.text}>Temperature</Text>
                  <Text style={styles.value}>{Math.round(parseFloat(currentDayData.degree))}°C</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.text}>Condition</Text>
                  <Text style={styles.value}>{translateDescription(currentDayData.description)}</Text>
                </View>
              </View>
            )}
            <ScrollView horizontal style={styles.scrollContainer}>
              {weatherData.result && weatherData.result.slice(1).map((dayData: DayData, index: number) => (
                <View key={index} style={styles.dayContainer}>
                  <Text style={styles.dayText}>{translateDay(dayData.day)}</Text>
                  <View style={styles.infoContainer}>
                    <Text style={styles.value}>{Math.round(parseFloat(dayData.degree))}°C</Text>
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.value}>{translateDescription(dayData.description)}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          <Text style={styles.loadingText}>Loading weather data...</Text>
        )}
      </View>
    </ImageBackground>
  );
};

// Ana uygulama bileşeni
const App: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [searchText, setSearchText] = useState('osaka');

  const getWeatherData = async (city: string) => {
    try {
      const data = await fetchWeatherData(city);
      setWeatherData(data);
    } catch (error) {
      console.error('Error setting weather data:', error);
    }
  };

  useEffect(() => {
    getWeatherData(searchText);
  }, [searchText]);

  const handleSearchTextChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleSearchSubmit = () => {
    getWeatherData(searchText);
  };

  return (
    <WeatherComponent
      weatherData={weatherData}
      searchText={searchText}
      setSearchText={handleSearchTextChange}
      handleSearchSubmit={handleSearchSubmit}
    />
  );
};

// Stiller
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.0)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    height: 40,
    borderColor: 'gray',
    marginBottom: 10,
    padding: 10,
    borderRadius: 15,
  },
  weatherIcon: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 5,
    position: 'absolute',
    top: 136,
  },
  currentDayContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 20,
    marginBottom: 30,
    borderRadius: 15,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    alignSelf: 'center',
    width: Dimensions.get('window').width * 0.9,
    marginTop: Dimensions.get('window').height * 0.35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scrollContainer: {
    height: 100,
    marginTop: 80,
  },
  dayContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 10,
    marginRight: 8,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 15,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    width: Dimensions.get('window').width * 0.6,
    height: 140,
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    marginBottom: 2,
    alignItems: 'center',
    height: 40,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888',
  },
});

export default App;
