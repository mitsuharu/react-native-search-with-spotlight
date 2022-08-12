import React, { useCallback, useRef } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  EventSubscription,
} from 'react-native'
import * as SearchWithSpotlight from 'react-native-search-with-spotlight'
import { useToast } from 'react-native-toast-notifications'
import { Button } from './components/Button'

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
          <Button
            text="(a) confirm to support spotlight"
            onPress={isSupported}
          />
          <Button
            text="(b) add Searchable items on this device"
            onPress={addSearchableItems}
          />
          <Button
            text="(c) delete Searchable items from this device"
            onPress={deleteSearchableItems}
          />
          <Button
            text="(d) add Listener for responses from this device"
            onPress={addListener}
          />
          <Button
            text="(e) remove Listener for responses from this device"
            onPress={removeListener}
          />
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
      description: 'This is a sample for react-native-search-with-spotlight.',
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
      toast.show(`[react-native-search-with-spotlight#isSupported] ${result}`)
    } catch (error: any) {
      toast.show(`[react-native-search-with-spotlight#isSupported] failed`)
    }
  }, [toast])

  const addSearchableItems = useCallback(async () => {
    try {
      toast.show(
        `[react-native-search-with-spotlight#addSearchableItems] now adding ...`
      )
      const items: SearchWithSpotlight.SearchableItem[] = makeSamples()
      await SearchWithSpotlight.addSearchableItems(items)
      toast.hideAll()
      toast.show(
        `[react-native-search-with-spotlight#addSearchableItems] succeed`
      )
    } catch (error: any) {
      toast.hideAll()
      toast.show(
        `[react-native-search-with-spotlight#addSearchableItems] failed: ${error.message}`
      )
    }
  }, [toast])

  const deleteSearchableItems = useCallback(async () => {
    try {
      toast.show(
        `[react-native-search-with-spotlight#deleteSearchableItems] now deleting ...`
      )
      await SearchWithSpotlight.deleteAll()
      toast.hideAll()
      toast.show(
        `[react-native-search-with-spotlight#deleteSearchableItems] succeed`
      )
    } catch (error: any) {
      toast.hideAll()
      toast.show(
        `[react-native-search-with-spotlight#deleteSearchableItems] failed: ${error.message}`
      )
    }
  }, [toast])

  const addListener = useCallback(() => {
    subscriptionRef.current = SearchWithSpotlight.addListener((response) => {
      toast.show(
        `[react-native-search-with-spotlight#addListener] receive (id: ${response.id}, query: ${response.query})`
      )
    })
    toast.show(
      `[react-native-search-with-spotlight#addListener] succeed. It can search some words on this native device.`
    )
  }, [toast])

  const removeListener = useCallback(() => {
    subscriptionRef.current?.remove()
    toast.show(`[react-native-search-with-spotlight#removeListener] succeed`)
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
})
