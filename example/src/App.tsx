import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  EventSubscription,
} from 'react-native';

import * as SearchOnDevice from 'react-native-search-with-spotlight';
import Toast from 'react-native-toast-message';

const isSupported = () => {
  console.log(`[isSupported]`);

  SearchOnDevice.isSupported().then((result) => {
    console.log(`[isSupported] ${result}`);
    Toast.show({ text1: `[isSupported] ${result}` });
    // Toast.show(`[isSupported] ${result}`);
  });
};

const addSearchableItems = () => {
  console.log(`[addSearchableItems]`);

  const makeSamples = () => {
    const samples: SearchOnDevice.SearchableItem[] = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 10; i++) {
      const sample: SearchOnDevice.SearchableItem = {
        title: `title${String(i)}`,
        id: `id-${String(i)}`,
        description: 'this is a sample.',
        keywords: ['title', 'spotlight', 'search'],
        imageUrl: `https://httpbin.org/image/${i % 2 === 0 ? 'png' : 'jpeg'}`,
        domain: 'sample',
      };
      samples.push(sample);
    }
    return samples;
  };

  const items: SearchOnDevice.SearchableItem[] = makeSamples();

  const toast = Toast.showLoading('adding...');
  SearchOnDevice.addSearchableItems(items)
    .then(() => {
      Toast.hide(toast);
      console.log(`[addSearchableItems] succeed`);
      Toast.show(`[addSearchableItems] succeed`);
    })
    .catch((error) => {
      Toast.hide(toast);
      console.log(`[addSearchableItems] failed: ${error.message}`);
      Toast.show(`[addSearchableItems] failed: ${error.message}`);
    });
};

const deleteSearchableItems = () => {
  console.log(`[deleteSearchableItems]`);
  SearchOnDevice.deleteAll()
    .then(() => {
      console.log(`[deleteSearchableItems] succeed`);
      Toast.show(`[deleteSearchableItems] succeed`);
    })
    .catch((error) => {
      console.log(`[deleteSearchableItems] failed: ${error.message}`);
      Toast.show(`[deleteSearchableItems] failed: ${error.message}`);
    });
};

var subscription: EventSubscription | null = null;

const addListener = () => {
  console.log(`[addListener]`);

  subscription = SearchOnDevice.addListener((response) => {
    console.log(`[addListener] (id: ${response.id}, query: ${response.query})`);
    Toast.show(`[addListener] (id: ${response.id}, query: ${response.query})`);
  });
  Toast.show(
    `[addListener] succeed. It can search some words on this native device`
  );
};

const removeListener = () => {
  console.log(`[removeListener]`);
  subscription?.remove();
  Toast.show(`[removeListener] succeed`);
};

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}
        >
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                react-native-search-with-spotlight
              </Text>
              <TouchableOpacity onPress={isSupported}>
                <Text style={styles.sectionDescription}>(a) isSupported</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addSearchableItems}>
                <Text style={styles.sectionDescription}>
                  (b) add Searchable items on this device
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteSearchableItems}>
                <Text style={styles.sectionDescription}>
                  (c) delete Searchable items from this device
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addListener}>
                <Text style={styles.sectionDescription}>
                  (d) add Listener for a response sent from this device
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={removeListener}>
                <Text style={styles.sectionDescription}>
                  (e) remove Listener for a response sent from this device
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#ffffff',
  },
  body: {
    backgroundColor: '#ffffff',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  sectionDescription: {
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 0,
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
  },
});

export default App;
