import { View, TextInput, SafeAreaView, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../theme';
import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid';

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState(["Ben Guerir, Morocco", "Casablanca, Morocco", "Marrakech, Morocco"]);

  const handleLocation = (loc) => {
    console.log('Location selected: ', loc);
  };

  return (
    <View style={{ flex: 1, position: 'relative', backgroundColor: 'black' }}>
      <StatusBar style="light" />

      {/*Image de fond */}
      <Image 
        blurRadius={70} 
        source={require('../assets/images/bg.jpg')}
        style={{ position: 'absolute', height: '100%', width: '100%' }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/*Barre de recherche */}
        <View style={{ height: '7%', marginHorizontal: 16, position: 'relative', zIndex: 50, marginTop: 50 }}>
          <View 
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              borderRadius: 30,
              backgroundColor: showSearch ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
              paddingHorizontal: 10,
              paddingVertical: 5
            }}
          >
            {showSearch && (
              <TextInput 
                placeholder="Search city" 
                placeholderTextColor="black"
                keyboardType="default"
                style={{
                  paddingLeft: 24, 
                  height: 40, 
                  flex: 1, 
                  fontSize: 16, 
                  color: 'black'
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
            <View style={{
              position: 'absolute',
              top: 70,
              width: '100%',
              backgroundColor: 'white', 
              borderRadius: 20,
              padding: 10
            }}>
              {locations.map((loc, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleLocation(loc)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                    borderBottomWidth: index !== locations.length - 1 ? 1 : 0,
                    borderBottomColor: 'gray'
                  }}
                >
                  <MapPinIcon size={20} color="gray" />
                  <Text style={{ color: 'black', fontSize: 16, marginLeft: 10 }}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/*Contenu principal */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {/*Nom de la ville */}
          <Text style={{ fontSize: 30, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
            Ben Guerir,{' '}
            <Text style={{ fontSize: 22, fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>
              Morocco
            </Text>
          </Text>

          {/*Image météo */}
          <Image
            source={require('../assets/images/partlycloudy.png')}
            style={{ width: 170, height: 170, resizeMode: 'contain', marginTop: 50 }}
          />

          {/*Température */}
          <Text style={{ fontSize: 50, fontWeight: 'bold', color: 'white', marginTop: -5 }}>
            23<Text style={{ fontSize: 30 }}>°</Text>
          </Text>
          <Text style={{ fontSize: 20, color: 'white', letterSpacing: 2, marginTop: 5 }}>
            Partly Cloudy
          </Text>

          {/*Détails météo */}
          <View style={{ flexDirection: 'row', marginTop: 40 }}>
            <View style={{ alignItems: 'center', marginHorizontal: 30 }}>
              <Image source={require('../assets/icons/wind.png')} style={{ height: 30, width: 30 }} />
              <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>22km/h</Text>
            </View>

            <View style={{ alignItems: 'center', marginHorizontal: 30 }}>
              <Image source={require('../assets/icons/drop.png')} style={{ height: 30, width: 30 }} />
              <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>23%</Text>
            </View>

            <View style={{ alignItems: 'center', marginHorizontal: 30 }}>
              <Image source={require('../assets/icons/sun.png')} style={{ height: 30, width: 30 }} />
              <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>5:30 AM</Text>
            </View>
          </View>
        </View>

        {/*Prévisions journalières */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
            <CalendarDaysIcon size={22} color="white" />
            <Text style={{ color: 'white', fontSize: 16, marginLeft: 5 }}>Daily forecast</Text>
          </View>
          <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 10, marginTop: 10 }} showsHorizontalScrollIndicator={false}>
            {[
              { day: "Monday", image: require("../assets/images/heavyrain.png") },
              { day: "Tuesday", image: require("../assets/images/sun.png") },
              { day: "Wednesday", image: require("../assets/images/cloud.png") },
              { day: "Thursday", image: require("../assets/images/moderaterain.png") },
              { day: "Friday", image: require("../assets/images/mist.png") },
              { day: "Saturday", image: require("../assets/images/sun.png") },
              { day: "Sunday", image: require("../assets/images/mist.png") }
            ].map((item, index) => (
              <View key={index} style={{ alignItems: 'center', marginRight: 20 }}>
                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 20, padding: 10 }}>
                  <Image source={item.image} style={{ height: 60, width: 60 }} />
                </View>
                <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>{item.day}</Text>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>13°</Text>
              </View>
            ))}
          </ScrollView>

        </View>
      </SafeAreaView>
    </View>
  );
}
