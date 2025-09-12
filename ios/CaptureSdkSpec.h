#import <React/RCTBridgeModule.h>

@protocol CaptureSdkSpec <RCTBridgeModule>

- (void)startCaptureService:(RCTPromiseResolveBlock)resolve
                    rejecter:(RCTPromiseRejectBlock)reject;

- (void)openTransport:(NSString *)host
             resolver:(RCTPromiseResolveBlock)resolve
             rejecter:(RCTPromiseRejectBlock)reject;

- (void)closeTransport:(NSNumber *)handle
              resolver:(RCTPromiseResolveBlock)resolve
              rejecter:(RCTPromiseRejectBlock)reject;

- (void)sendTransport:(NSNumber *)handle
              jsonRpc:(NSString *)jsonRpc
             resolver:(RCTPromiseResolveBlock)resolve
             rejecter:(RCTPromiseRejectBlock)reject;

- (void)getTargetView:(NSNumber *)reactTag;

- (void)dismissViewController;

@end
