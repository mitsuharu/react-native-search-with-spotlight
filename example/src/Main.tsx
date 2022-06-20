import React, { useCallback, useRef } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  EventSubscription,
} from 'react-native'
import * as SearchWithSpotlight from 'react-native-search-with-spotlight'
import { useToast } from 'react-native-toast-notifications'

type Props = {}
type ComponentProps = Props & {
  isSupported: () => void
  addSearchableItems: () => void
  deleteSearchableItems: () => void
  addListener: () => void
  removeListener: () => void
}

const Component: React.FC<ComponentProps> = ({
  isSupported,
  addSearchableItems,
  deleteSearchableItems,
  addListener,
  removeListener,
}) => {
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            react-native-search-with-spotlight
          </Text>
          <TouchableOpacity onPress={isSupported}>
            <Text style={styles.sectionDescription}>
              (a) confirm to support spotlight
            </Text>
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
      </ScrollView>
    </SafeAreaView>
  )
}

const makeSamples = () => {
  const samples = [...Array(10)].map((_, i) => {
    const title = `title-${String(i)}`
    const id = `id-${String(i)}`
    const sample: SearchWithSpotlight.SearchableItem = {
      title: title,
      id: id,
      description: 'this is a sample for react-native-search-with-spotlight',
      keywords: [
        'sample',
        'spotlight',
        'react-native-search-with-spotlight',
        title,
        id,
      ],
      imageUrl: `https://httpbin.org/image/${i % 2 === 0 ? 'png' : 'jpeg'}`,
      domain: 'sample',
    }
    return sample
  })
  return samples
}

const Container: React.FC<Props> = (props) => {
  const toast = useToast()
  const subscriptionRef = useRef<EventSubscription | null>(null)

  const isSupported = useCallback(async () => {
    try {
      const result = await SearchWithSpotlight.isSupported()
      toast.show(`[isSupported] isSupported: ${result}`)
    } catch (error: any) {
      toast.show(`[isSupported] isSupported: failed`)
    }
  }, [toast])

  const addSearchableItems = useCallback(async () => {
    try {
      toast.show(`[addSearchableItems] now adding ...`)
      const items: SearchWithSpotlight.SearchableItem[] = makeSamples()
      await SearchWithSpotlight.addSearchableItems(items)
      toast.hideAll()
      toast.show(`[addSearchableItems] succeed`)
    } catch (error: any) {
      toast.hideAll()
      toast.show(`[addSearchableItems] failed: ${error.message}`)
    }
  }, [toast])

  const deleteSearchableItems = useCallback(async () => {
    try {
      toast.show(`[deleteSearchableItems] now deleting ...`)
      await SearchWithSpotlight.deleteAll()
      toast.hideAll()
      toast.show(`[deleteSearchableItems] succeed`)
    } catch (error: any) {
      toast.hideAll()
      toast.show(`[deleteSearchableItems] failed: ${error.message}`)
    }
  }, [toast])

  const addListener = useCallback(() => {
    subscriptionRef.current = SearchWithSpotlight.addListener((response) => {
      toast.show(
        `[addListener] receive (id: ${response.id}, query: ${response.query})`
      )
    })
    toast.show(
      `[addListener] succeed. It can search some words on this native device`
    )
  }, [toast])

  const removeListener = useCallback(() => {
    subscriptionRef.current?.remove()
    toast.show(`[removeListener] succeed`)
  }, [toast])

  return (
    <Component
      {...props}
      isSupported={isSupported}
      addSearchableItems={addSearchableItems}
      deleteSearchableItems={deleteSearchableItems}
      addListener={addListener}
      removeListener={removeListener}
    />
  )
}

export { Container as Main }

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#ffffff',
  },
  scrollView: {
    backgroundColor: '#ffffff',
  },
  sectionContainer: {
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
})
