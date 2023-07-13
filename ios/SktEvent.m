//
//  SktEvent.m
//  Capture
//
//  Created by Eric Glaenzer on 8/25/11.
//  Copyright 2011 SocketMobile. All rights reserved.
//
#import <CaptureSDK/CaptureSDK.h>
#import "SktEvent.h"

NSMutableDictionary* gNamedEvent=nil;

@implementation SktEventInfo

@synthesize lock=_lock;
@synthesize signaled=_signaled;

-(id)init{
    self=[super init];
    if(self!=nil){
        _lock=[[NSConditionLock alloc]init];
        _signaled=NO;
    }
    return self;
}

-(id)initWithCondition:(NSInteger)condition{
    self=[super init];
    if(self!=nil){
        _lock=[[NSConditionLock alloc]initWithCondition:condition];
        _signaled=NO;
    }
    return self;
}

-(void)dealloc{
    _lock=nil;
}
@end

@implementation SktEvent


-(id)init{
    self=[super init];
    return self;
}

-(void)dealloc{
    [self deleteEvent];
//    [super dealloc];
}
/**
 *
 *
 */
-(SKTResult)createEvent:(BOOL)automatic{
    NSLog(@"IN CREATE");
    SKTResult result=SKTCaptureE_NOERROR;
    if(_eventInfo!=nil)
        result=SKTCaptureE_ALREADYEXISTING;
    if(SKTSUCCESS(result)){
        _automatic = automatic;
        _eventInfo = [[SktEventInfo alloc]initWithCondition:EVENT_NOT_SIGNALED];
        _eventDelegateLock = [SktEventInfo new];
        _name=nil;

    }
    return result;
}

-(SKTResult)createEventWithName:(NSString*)name Automatic:(BOOL)automatic{
    SKTResult result=SKTCaptureE_NOERROR;
    if(_eventInfo!=nil)
        result=SKTCaptureE_ALREADYEXISTING;

    // if there is no Named event yet then
    // create the named event dictionary here
    if(SKTSUCCESS(result)){
        if(gNamedEvent==nil)
            gNamedEvent=[[NSMutableDictionary alloc]init];
        @try {
//            _eventInfo=[[gNamedEvent valueForKey:name]retain];
            _eventInfo=[gNamedEvent valueForKey:name];
        }
        @catch (NSException *exception) {
            _eventInfo=nil;
        }
        @catch (NSException *exception) {
            _eventInfo=nil;
        }
        @finally {
        }
        if(_eventInfo==nil){
            _eventInfo=[[SktEventInfo alloc]initWithCondition:EVENT_NOT_SIGNALED];
            _eventDelegateLock = [SktEventInfo new];
            @try {
                [gNamedEvent setValue:_eventInfo forKey:name];
            }
            @catch (NSException *exception) {
                result=SKTCaptureE_EVENTNOTCREATED;
            }
            @finally {
            }
        }
        _name=[[NSString alloc]initWithString:name];
    }

    if(SKTSUCCESS(result)){
        _automatic=automatic;
    }
    return result;
}

-(SKTResult)deleteEvent{
    // if it is a named event
    // then remove it from the list
    if(_name != nil){
        [gNamedEvent setValue:nil forKey:_name];
    }
    if(_eventInfo != nil){
        _eventInfo = nil;
        _eventDelegateLock = nil;
    }

    _name = nil;

    return SKTCaptureE_NOERROR;
}

-(SKTResult)setEvent{
    SKTResult result=SKTCaptureE_NOERROR;
    NSLog(@"IN SET EVENT");
    NSLog(@"EVENT INFO: %@", _eventInfo);
    if(_eventInfo!=nil){
        [_eventInfo.lock lock];
        _eventInfo.signaled=YES;
        [_eventInfo.lock unlockWithCondition:EVENT_SIGNALED];

    }
    else
        result=SKTCaptureE_EVENTNOTCREATED;
    return result;
}

-(SKTResult)resetEvent{
    SKTResult result=SKTCaptureE_NOERROR;
    if(_eventInfo!=nil){
        [_eventInfo.lock lock];
        _eventInfo.signaled=NO;
        [_eventInfo.lock unlockWithCondition:EVENT_NOT_SIGNALED];
    }
    else
        result=SKTCaptureE_EVENTNOTCREATED;
    return result;
}

-(SKTResult)waitEvent:(long)milliseconds{
    SKTResult result=SKTCaptureE_NOERROR;
    NSLog(@"IN WAIT EVENT");
    NSLog(@"EVENT INFO: %@", _eventInfo);
    if(_eventInfo!=nil){
         NSLog(@"EVENT INFO SIGNALED: %d",_eventInfo.signaled);
        if(_eventInfo.signaled==NO){
//            NSAutoreleasePool *localPool = [[NSAutoreleasePool alloc] init];
            @autoreleasepool {
                long scale = milliseconds>100? 100: 10;
                long numberOfTime = milliseconds / scale;
                useconds_t timeout = (useconds_t)scale * 1000;// microseconds
                while(numberOfTime>=0){
                    if([_eventInfo.lock tryLockWhenCondition:EVENT_SIGNALED]==YES){
                        
                        if(_eventInfo.signaled==NO){
                            if(numberOfTime>0){
                                usleep(timeout);
                            }
                            else{
                                result=SKTCaptureE_WAITTIMEOUT;
                            }
                        }
                        else{
                            numberOfTime=0;// stop the while loop
                        }
                        
                        // reset the event if automatic
                        if(_automatic==YES){
                            _eventInfo.signaled=NO;
                            [_eventInfo.lock unlockWithCondition:EVENT_NOT_SIGNALED];
                        }
                        else{
                            [_eventInfo.lock unlock];
                        }
                    }
                    else {
                        if(numberOfTime>0){
                            usleep(timeout);
                        }
                        else{
                            result=SKTCaptureE_WAITTIMEOUT;
                        }
                    }
                    --numberOfTime;
                }
            }
//            [localPool drain];
        }
        else{
            // reset the event if automatic
            if(_automatic==YES){
                [_eventInfo.lock lock];
                _eventInfo.signaled=NO;
                [_eventInfo.lock unlockWithCondition:EVENT_NOT_SIGNALED];
            }
        }
    }
    else{
        result=SKTCaptureE_EVENTNOTCREATED;
    }
    return result;
}


-(SKTResult)lockEventDelegate {
    if(_eventDelegateLock != nil){
        [[_eventDelegateLock lock] lock];
    }
    else {
        return SKTCaptureE_NOTINITIALIZED;
    }
    return SKTCaptureE_NOERROR;
}

-(SKTResult)unlockEventDelegate {
    if(_eventDelegateLock != nil){
        [[_eventDelegateLock lock] unlock];
    }
    else {
        return SKTCaptureE_NOTINITIALIZED;
    }
    return SKTCaptureE_NOERROR;
}
@end
