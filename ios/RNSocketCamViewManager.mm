// ios/RNSocketCamViewManager.mm
#import "RNSocketCamViewManager.h"
#import "SocketCamContainerView.h"

@implementation RNSocketCamViewManager

// The component name exposed to JS is "RNSocketCamView"
// (class name minus "Manager" suffix, per RCTViewManager convention)
RCT_EXPORT_MODULE(RNSocketCamView)

- (UIView *)view {
    return [[SocketCamContainerView alloc] initWithFrame:CGRectZero];
}

@end
