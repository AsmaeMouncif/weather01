import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../theme';
import { CalendarDaysIcon, MagnifyingGlassIcon, XMarkIcon, MapPinIcon } from 'react-native-heroicons/outline';
import { debounce } from 'lodash';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [mapVisible, setMapVisible] = useState(false);

  const saveLocation = async (location) => {
    try {
      await AsyncStorage.setItem('selectedLocation', JSON.stringify(location));
    } catch (error) {
      console.log('Error saving location:', error);
    }
  };

  const getSavedLocation = async () => {
    try {
      const location = await AsyncStorage.getItem('selectedLocation');
      if (location !== null) {
        return JSON.parse(location);
      }
    } catch (error) {
      console.log('Error retrieving location:', error);
    }
    return null;
  };

  const fetchWeatherByLocation = async (latitude, longitude) => {
    try {
      const data = await fetchWeatherForecast({ lat: latitude, lon: longitude, days: 7, apiKey: 'be3efc7359c660d49ef49744e0a7953e' });
      if (data && data.list && data.list.length > 0) {
        setWeatherData(data.list[0]);
        setDailyForecast(data.list);
        setSelectedLocation('My Location');
        saveLocation({ name: 'My Location', lat: latitude, lon: longitude });
      } else {
        console.log('No weather data available.');
      }
    } catch (error) {
      console.log('Error fetching weather data:', error);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      fetchWeatherByLocation(latitude, longitude);
    } catch (error) {
      console.log('Error fetching location:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const savedLocation = await getSavedLocation();
      if (savedLocation) {
        setSelectedLocation(savedLocation.name);
        fetchWeatherByLocation(savedLocation.lat, savedLocation.lon);
      } else {
        handleCurrentLocation();
      }
    };
    init();
  }, []);

  const handleLocation = (loc) => {
    fetchWeatherForecast({ cityName: loc, days: 7, apiKey: 'be3efc7359c660d49ef49744e0a7953e' })
      .then(data => {
        if (data && data.list && data.list.length > 0) {
          setWeatherData(data.list[0]);
          setDailyForecast(data.list);
          setSelectedLocation(loc);
          saveLocation({ name: loc, lat: data.city.coord.lat, lon: data.city.coord.lon });
        }
      })
      .catch(error => console.log('Error fetching weather data:', error));
    setLocations([]);
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value, apiKey: 'be3efc7359c660d49ef49744e0a7953e' })
        .then(data => {
          if (data && data.list) {
            setLocations(data.list);
          } else {
            setLocations([]);
          }
        })
        .catch(error => {
          console.log('Error fetching locations:', error);
          setLocations([]);
        });
    } else {
      setLocations([]);
    }
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 300), []);

  const kelvinToCelsius = (kelvin) => (kelvin - 273.15).toFixed(1);

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Clear': return require('../assets/images/sun.png');
      case 'Clouds': return require('../assets/images/cloud.png');
      case 'Rain': return require('../assets/images/moderaterain.png');
      case 'Mist': return require('../assets/images/mist.png');
      case 'Drizzle': return require('../assets/images/heavyrain.png');
      default: return require('../assets/images/partlycloudy.png');
    }
  };

  return (
    <View style={{ flex: 1, position: 'relative', backgroundColor: 'black' }}>
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require('../assets/images/bg.jpg')}
        style={{ position: 'absolute', height: '100%', width: '100%' }}
      />
      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <View style={{ height: '7%', marginHorizontal: 16, marginTop: 50 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              borderRadius: 20,
              backgroundColor: showSearch ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            {showSearch && (
              <TextInput
                onChangeText={handleTextDebounce}
                placeholder="Search city"
                placeholderTextColor="white"
                keyboardType="default"
                style={{ paddingLeft: 24, height: 40, flex: 1, fontSize: 16, color: 'white' }}
              />
            )}
            <TouchableOpacity
              style={{ backgroundColor: theme.bgWhite ? theme.bgWhite(0.3) : 'rgba(255, 255, 255, 0.3)', borderRadius: 50, padding: 10 }}
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
                padding: 10,
                zIndex: 100,
                elevation: 5,
              }}
            >
              {locations.map((loc, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleLocation(loc.name)}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: index !== locations.length - 1 ? 1 : 0, borderBottomColor: 'gray' }}
                >
                  <MapPinIcon size={20} color="gray" />
                  <Text style={{ color: 'black', fontSize: 16, marginLeft: 10 }}>{loc.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {selectedLocation && weatherData && (
            <>
              <Text style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', marginBottom: 5 }}>
                {selectedLocation}, <Text style={{ fontSize: 16 }}>Morocco</Text>
              </Text>
              <Image
                source={getWeatherIcon(weatherData.weather[0].main)}
                style={{ width: 170, height: 170, resizeMode: 'contain' }}
              />
              <Text style={{ fontSize: 50, fontWeight: 'bold', color: 'white', marginTop: -5 }}>
                {kelvinToCelsius(weatherData.main.temp)}<Text style={{ fontSize: 30 }}>°C</Text>
              </Text>
              <Text style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.8)', letterSpacing: 2, marginTop: 5 }}>
                {weatherData.weather[0].description}
              </Text>
            </>
          )}
        </View>
        {weatherData && (
          <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 20 }}>
            <View style={{ alignItems: 'center', marginHorizontal: 30 }}>
              <Image source={require('../assets/icons/wind.png')} style={{ height: 30, width: 30 }} />
              <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>{weatherData.wind.speed} km/h</Text>
              <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>{weatherData.wind.deg}°</Text>
            </View>
            <View style={{ alignItems: 'center', marginHorizontal: 30 }}>
              <Image source={require('../assets/icons/drop.png')} style={{ height: 30, width: 30 }} />
              <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>{weatherData.main.humidity}%</Text>
            </View>
            <View style={{ alignItems: 'center', marginHorizontal: 30 }}>
              <Image source={require('../assets/icons/sun.png')} style={{ height: 30, width: 30 }} />
              <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>{new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</Text>
            </View>
          </View>
        )}
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
                <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>{kelvinToCelsius(item.main.temp)}°C</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10,
            paddingVertical: 10,
            marginHorizontal: 20,
          }}
          onPress={() => setMapVisible(true)}
        >
          <MapPinIcon size={25} color="white" style={{ marginRight: 10 }} />
          <Text style={{ color: 'white', fontSize: 16 }}>View Map</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={mapVisible} transparent={true} animationType="slide" onRequestClose={() => setMapVisible(false)}>
        <View style={styles.modalContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 31.7917,
              longitude: -7.0926,
              latitudeDelta: 10,
              longitudeDelta: 10,
            }}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: weatherData?.city?.coord?.lat || 31.7917,
                  longitude: weatherData?.city?.coord?.lon || -7.0926,
                }}
              />
            )}
          </MapView>
          <TouchableOpacity style={styles.closeButton} onPress={() => setMapVisible(false)}>
            <XMarkIcon size={25} color="black" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  map: {
    width: '90%',
    height: '70%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});