// ios/SocketCamContainerView.h
#import <UIKit/UIKit.h>

extern NSString * const kSocketCamViewReadyNotification;
extern NSString * const kSocketCamViewDismissedNotification;

/// A UIView that hosts the SDK-provided socketCamView.
/// It self-registers for SocketCam notifications on init and removes
/// the SDK subview when the notification arrives.
@interface SocketCamContainerView : UIView
@end
