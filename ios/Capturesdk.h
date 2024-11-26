
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNCaptureSdkSpec.h"

@interface CaptureSdk : NSObject <CaptureSdkSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface CaptureSdk : RCTEventEmitter <RCTBridgeModule>
#endif

@end
