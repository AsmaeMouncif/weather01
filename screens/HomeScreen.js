import { View, TextInput, SafeAreaView, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import React, { useCallback, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../theme';
import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/outline';
import { debounce } from 'lodash';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [dailyForecast, setDailyForecast] = useState([]);

  const handleLocation = (loc) => {
    console.log('Location selected: ', loc);

    // Fetch weather data for the selected location (7 days forecast)
    fetchWeatherForecast({ cityName: loc, days: 7, apiKey: 'be3efc7359c660d49ef49744e0a7953e' })
      .then(data => {
        console.log('Weather data for selected city: ', data);
        if (data && data.list && data.list.length > 0) {
          setWeatherData(data.list[0]); // First day's data (current weather)
          setDailyForecast(data.list); // Set all 7 days for daily forecast
          setSelectedLocation(loc); // Store the selected city
        } else {
          console.log('No weather data available for this location.');
        }
      })
      .catch(error => {
        console.log('Error fetching weather data:', error);
      });

    setLocations([]);
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value, apiKey: 'be3efc7359c660d49ef49744e0a7953e' }).then(data => {
        console.log('Found locations: ', data);

        const uniqueLocations = data.list.filter((value, index, self) => 
          index === self.findIndex((t) => (
            t.name === value.name
          ))
        );

        setLocations(uniqueLocations);
      });
    }
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  // Function to convert temperature from Kelvin to Celsius
  const kelvinToCelsius = (kelvin) => {
    return (kelvin - 273.15).toFixed(1);
  };

  // Function to get the appropriate weather icon based on weather condition
  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Clear':
        return require('../assets/images/sun.png');
      case 'Clouds':
        return require('../assets/images/cloud.png');
      case 'Rain':
        return require('../assets/images/moderaterain.png');
      case 'Mist':
        return require('../assets/images/mist.png');
      case 'Drizzle':
        return require('../assets/images/heavyrain.png');
      default:
        return require('../assets/images/partlycloudy.png');
    }
  };

  return (
    <View style={{ flex: 1, position: 'relative', backgroundColor: 'black' }}>
      <StatusBar style="light" />

      {/* Background image */}
      <Image
        blurRadius={70}
        source={require('../assets/images/bg.jpg')}
        style={{ position: 'absolute', height: '100%', width: '100%' }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Search bar */}
        <View style={{ height: '7%', marginHorizontal: 16, position: 'relative', zIndex: 50, marginTop: 50 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              borderRadius: 20,
              backgroundColor: showSearch ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
              paddingHorizontal: 10,
              paddingVertical: 5
            }}
          >
            {showSearch && (
              <TextInput
                onChangeText={handleTextDebounce}
                placeholder="Search city"
                placeholderTextColor="white"
                keyboardType="default"
                style={{
                  paddingLeft: 24,
                  height: 40,
                  flex: 1,
                  fontSize: 16,
                  color: 'white'
                }}
              />
            )}

            <TouchableOpacity
              style={{
                backgroundColor: theme.bgWhite ? theme.bgWhite(0.3) : 'rgba(255, 255, 255, 0.3)',
                borderRadius: 50,
                padding: 10
              }}
              onPress={() => toggleSearch(!showSearch)}
            >
              <MagnifyingGlassIcon size={25} color="white" />
            </TouchableOpacity>
          </View>

          {showSearch && locations.length > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 60,
                width: '100%',
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 10
              }}
            >
              {locations.map((loc, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleLocation(loc.name)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                    borderBottomWidth: index !== locations.length - 1 ? 1 : 0,
                    borderBottomColor: 'gray'
                  }}
                >
                  <MapPinIcon size={20} color="gray" />
                  <Text style={{ color: 'black', fontSize: 16, marginLeft: 10 }}>{loc.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Main content */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {selectedLocation && weatherData && (
            <>
              {/* City Name */}
              <Text style={{ fontSize: 30, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                {selectedLocation},{' '}
                <Text style={{ fontSize: 22, fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Morocco
                </Text>
              </Text>

              {/* Weather Image */}
              <Image
                source={getWeatherIcon(weatherData.weather[0].main)}
                style={{ width: 170, height: 170, resizeMode: 'contain', marginTop: 50 }}
              />

              {/* Temperature */}
              <Text style={{ fontSize: 50, fontWeight: 'bold', color: 'white', marginTop: -5 }}>
                {kelvinToCelsius(weatherData.main.temp)}
                <Text style={{ fontSize: 30 }}>°C</Text>
              </Text>
              <Text style={{ fontSize: 20, color: 'white', letterSpacing: 2, marginTop: 5 }}>
                {weatherData.weather[0].description}
              </Text>
            </>
          )}
        </View>

        {/* Weather Details */}
        {weatherData && (
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={{ alignItems: 'center', marginHorizontal: 30 }}>
              <Image source={require('../assets/icons/wind.png')} style={{ height: 30, width: 30 }} />
              <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>{weatherData.wind.speed} km/h</Text>
            </View>

            <View style={{ alignItems: 'center', marginHorizontal: 30 }}>
              <Image source={require('../assets/icons/drop.png')} style={{ height: 30, width: 30 }} />
              <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>
                {weatherData.main.humidity}%
              </Text>
            </View>

            <View style={{ alignItems: 'center', marginHorizontal: 30 }}>
              <Image source={require('../assets/icons/sun.png')} style={{ height: 30, width: 30 }} />
              <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>
                {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        )}

        {/* Daily Forecast */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
            <CalendarDaysIcon size={22} color="white" />
            <Text style={{ color: 'white', fontSize: 16, marginLeft: 5 }}>Daily forecast</Text>
          </View>
          <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 10, marginTop: 10 }} showsHorizontalScrollIndicator={false}>
            {dailyForecast.map((item, index) => (
              <View key={index} style={{ alignItems: 'center', marginRight: 20 }}>
                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 20, padding: 10 }}>
                  <Image source={getWeatherIcon(item.weather[0].main)} style={{ height: 60, width: 60 }} />
                </View>
                <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>
                  {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>
                  {kelvinToCelsius(item.main.temp)}°C
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
