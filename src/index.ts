import {
  EventSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

export type SearchableItem = {
  title: string;
  id: string;
  description: string | null;
  keywords: string[] | null;
  imageUrl: string | null;
  domain: string | null;
};

export type Response = { id: string | null; query: string | null };
export type Callback = (response: Response) => void;

interface SearchWithSpotlight {
  isSupported: () => Promise<boolean>;
  addSearchableItems: (items: SearchableItem[]) => Promise<void>;
  deleteAll: () => Promise<void>;
  deleteIdentifiers: (identifiers: string[]) => Promise<void>;
  deleteDomains: (domains: string[]) => Promise<void>;
}

const searchWithSpotlight: SearchWithSpotlight =
  NativeModules.SearchWithSpotlight;

const Constants = {
  onSearchWithSpotlightRequest: 'onSearchWithSpotlightRequest',
};
const emitter = new NativeEventEmitter(NativeModules.SearchWithSpotlight);

/**
 * @returns true if your device supports spotlight (iOS)
 */
export const isSupported = Platform.select<() => Promise<boolean>>({
  ios: () => searchWithSpotlight.isSupported(),
  default: () => new Promise((resolve) => resolve(false)),
});

export const addSearchableItems = Platform.select<
  (items: SearchableItem[]) => Promise<void>
>({
  ios: (items) => searchWithSpotlight.addSearchableItems(items),
  default: () => Promise.resolve(),
});

export const deleteAll = Platform.select<() => Promise<void>>({
  ios: () => searchWithSpotlight.deleteAll(),
  default: () => Promise.resolve(),
});

export const deleteIdentifiers = Platform.select<
  (identifiers: string[]) => Promise<void>
>({
  ios: (identifiers) => searchWithSpotlight.deleteIdentifiers(identifiers),
  default: () => Promise.resolve(),
});

export const deleteDomains = Platform.select<
  (domains: string[]) => Promise<void>
>({
  ios: (domains) => searchWithSpotlight.deleteDomains(domains),
  default: () => Promise.resolve(),
});

/**
 * Adds an event listener for a response sent from native device.
 *
 * @example
 * const subscription = SearchWithSpotlight.addListener((response) =>{
 *   console.log(`(id: ${response.id}, query: ${response.query})`)
 * })
 *
 * // remove
 * subscription.remove()
 *
 */
export const addListener = Platform.select<
  (callback: Callback) => EventSubscription
>({
  ios: (callback) =>
    emitter.addListener(Constants.onSearchWithSpotlightRequest, callback),
  default: () => {
    throw Error(
      `Platform ${Platform.OS} doesn't support search-with-spotlight.`
    );
  },
});
