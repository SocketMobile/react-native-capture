//
//  RNSktEvent.h
//  Capture
//
//  Created by Eric Glaenzer on 8/25/11.
//  Copyright 2011 SocketMobile. All rights reserved.
//
// Local copy of the Capture event helper, prefixed RN so its classes cannot
// collide with the ones embedded in CaptureSDK.framework.
#import <CaptureSDK/CaptureSDK.h>
#import <Foundation/Foundation.h>

@interface RNSktEventInfo : NSObject
{
    NSConditionLock *_lock;
    BOOL _signaled;
}
@property(readwrite, nonatomic, retain) NSConditionLock *lock;
@property(readwrite, nonatomic) BOOL signaled;

- (id)init;
- (id)initWithCondition:(NSInteger)condition;
- (void)dealloc;

@end

@interface RNSktEvent : NSObject
{
    RNSktEventInfo *_eventInfo;
    RNSktEventInfo *_eventDelegateLock;
    NSString *_name;
    BOOL _automatic;
    enum
    {
        EVENT_SIGNALED,
        EVENT_NOT_SIGNALED
    } _type;
}
- (id)init;
- (void)dealloc;
- (SKTResult)createEvent:(BOOL)automatic;
- (SKTResult)createEventWithName:(NSString *)name Automatic:(BOOL)automatic;
- (SKTResult)deleteEvent;
- (SKTResult)setEvent;
- (SKTResult)resetEvent;
- (SKTResult)waitEvent:(long)milliseconds;
- (SKTResult)lockEventDelegate;
- (SKTResult)unlockEventDelegate;
@end
