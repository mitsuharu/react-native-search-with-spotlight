//
//  Bridging-Header.h
//  SearchWithSpotlight
//
//  Created by Mitsuharu Emoto on 2022/06/19.
//  Copyright © 2022 Facebook. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTRootView.h>

@interface SearchWithSpotlight

+ (void)setup:(RCTBridge*)bridge;
+ (BOOL)handle:(NSUserActivity*)userActivity;

@end
