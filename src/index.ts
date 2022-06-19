import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-search-with-spotlight' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const SearchWithSpotlight = NativeModules.SearchWithSpotlight
  ? NativeModules.SearchWithSpotlight
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return SearchWithSpotlight.multiply(a, b);
}
