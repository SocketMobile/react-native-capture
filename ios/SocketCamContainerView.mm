// ios/SocketCamContainerView.mm
#import "SocketCamContainerView.h"

NSString * const kSocketCamViewReadyNotification     = @"com.socketmobile.SocketCamViewReady";
NSString * const kSocketCamViewDismissedNotification = @"com.socketmobile.SocketCamViewDismissed";

@implementation SocketCamContainerView

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
        [nc addObserver:self
               selector:@selector(handleViewReady:)
                   name:kSocketCamViewReadyNotification
                 object:nil];
        [nc addObserver:self
               selector:@selector(handleViewDismissed)
                   name:kSocketCamViewDismissedNotification
                 object:nil];
    }
    return self;
}

- (void)handleViewReady:(NSNotification *)notification {
    UIView *sdkView = notification.userInfo[@"view"];
    if (!sdkView) return;
    dispatch_async(dispatch_get_main_queue(), ^{
        [self embedView:sdkView];
    });
}

- (void)handleViewDismissed {
    dispatch_async(dispatch_get_main_queue(), ^{
        for (UIView *sub in self.subviews) {
            [sub removeFromSuperview];
        }
    });
}

- (void)embedView:(UIView *)sdkView {
    sdkView.frame = self.bounds;
    sdkView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self addSubview:sdkView];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end
