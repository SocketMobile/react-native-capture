//
//  SktEvent.h
//  Capture
//
//  Created by Eric Glaenzer on 8/25/11.
//  Copyright 2011 SocketMobile. All rights reserved.
//
#import <CaptureSDK/CaptureSDK.h>
#import <Foundation/Foundation.h>

@interface SktEventInfo : NSObject
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

@interface SktEvent : NSObject
{
    SktEventInfo *_eventInfo;
    SktEventInfo *_eventDelegateLock;
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
