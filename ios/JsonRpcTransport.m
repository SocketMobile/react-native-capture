#import "JsonRpcTransport.h"
#import "CaptureSDK.h"

@interface JsonRpcTransport () <SKTCaptureDelegate> {
    SKTCapture* _capture;
    bool _captureOpened;
    NSMutableDictionary* _devices;
    bool _hasListeners;
}
@end

@implementation JsonRpcTransport

// to export a module named JsonRpcTransport
RCT_EXPORT_MODULE()

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onCaptureEvent"];
}

-(void)startObserving{
    _hasListeners = YES;
    NSLog(@"startObserving");
}

-(void)stopObserving{
    _hasListeners = NO;
    NSLog(@"stopObserving");
}

#pragma mark - React Native Entry Methods
RCT_EXPORT_METHOD(startCaptureService:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve(@{});
}

RCT_EXPORT_METHOD(openTransport:(NSString *)host
    resolver:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    _captureOpened = false;
    NSNumber* handle = [NSNumber numberWithInt:(int) 0x1234];
    resolve(@{@"transport":@{@"handle": handle}});
}

RCT_EXPORT_METHOD(closeTransport:(nonnull NSNumber *)handle
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve(@[[NSString stringWithFormat: @"%ld closed",(long)handle]]);
}

RCT_EXPORT_METHOD(sendTransport:(nonnull NSNumber*)handle jsonRpc:(NSString*)jsonRpc
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try{
        id rpc = [JsonRpcTransport ParseFromJson:jsonRpc];
        if ([rpc isKindOfClass:[NSArray class]]){
            reject(@"JSON-RPC Array not supported",@"",nil);
            return;
        }
        [self callMethodFromJsonRpc:rpc completionHandler:^(NSString *response) {
            resolve(response);
        }];
    }
    @catch(NSException *e){
        reject(@"", [NSString stringWithFormat:@"Error %@: %@", [e name], [e reason]], nil);
        return;
    }

}

#pragma mark - main switch from JSON RPC methods to Capture methods
-(void)callMethodFromJsonRpc:(NSDictionary*)jsonRpc completionHandler:(void(^)(NSString* response)) block {
    NSString* method;
    NSInteger jsonRpcId;
    @try{
        method = [jsonRpc objectForKey:@"method"];
        jsonRpcId = [[jsonRpc objectForKey:@"id"]integerValue];
        if(method == nil){
            NSException *exception = [NSException
                        exceptionWithName:@"JsonParsingException"
                        reason:@"missing jsonrpc method"
                        userInfo:nil];
            @throw exception;
        }
    }
    @catch(NSException *ex){
        NSLog(@"%@", ex.reason);
        block(@"{\"jsonrpc\": \"2.0\", \"error\":{\"code\": -32700, \"message\": \"unable to parse the JSON-RPC\"}}");
        return;
    }
    NSDictionary* params;
    method = [method lowercaseString];
    if([method  isEqual: @"openclient"]){
        if(_captureOpened == true){
            block([JsonRpcTransport returnJsonRpcWithError:SKTCaptureE_ALREADYDONE withMessage:@"Capture already open" withId:jsonRpcId]);
            return;
        }
        _captureOpened = true;
        params = [jsonRpc objectForKey:@"params"];
//        NSDictionary* appInfoDictionary = [params objectForKey:@"appInfo"];
        SKTAppInfo* appInfo = [SKTAppInfo new];
        appInfo.AppID = [params objectForKey:@"appId"];
        appInfo.DeveloperID = [params objectForKey:@"developerId"];
        appInfo.AppKey = [params objectForKey:@"appKey"];
        if(_capture == nil){
            _capture = [[SKTCapture alloc]initWithDelegate:self];
        }
        else {
            [_capture setDelegate:self];
        }
        [_capture openWithAppInfo:appInfo completionHandler:^(SKTResult result) {
            NSString* response;
            NSLog(@"Opening Capture returns: %ld", result);
            if(SKTSUCCESS(result)){
                NSInteger handle = (int)self->_capture;
                response = [JsonRpcTransport returnJsonRpcWithHandle:handle withId:jsonRpcId];
            }
            else{
                response = [JsonRpcTransport returnJsonRpcWithError:result withMessage:@"failed to open Capture" withId:jsonRpcId];
                self->_captureOpened = false;
            }
            if(block != nil){
                block(response);
            }
        }];
        
    }
    else if ([method  isEqual: @"opendevice"]){
        params = [jsonRpc objectForKey:@"params"];
        NSString* guid = [params objectForKey:@"guid"];
        NSInteger handle = [[params objectForKey:@"handle"] integerValue];
        if(handle == (int) _capture){
            [_capture openDeviceWithGuid:guid completionHandler:^(SKTResult result, SKTCapture *deviceCapture) {
                NSString* response;
                NSLog(@"Opening Capture Device returns: %ld", result);
                if(SKTSUCCESS(result)){
                    if(self->_devices == nil){
                        self->_devices = [NSMutableDictionary new];
                    }
                    NSString* deviceHandle = [NSString stringWithFormat:@"%d",(int)deviceCapture];
                    [self->_devices setValue:deviceCapture forKey:deviceHandle];
                    NSInteger handleValue = (int)deviceCapture;
                    response = [JsonRpcTransport returnJsonRpcWithHandle:handleValue withId:jsonRpcId];
                }
                else{
                    response = [JsonRpcTransport returnJsonRpcWithError:result withMessage:@"failed to open the device" withId:jsonRpcId];
                }
                if(block != nil){
                    block(response);
                }
            }];
        }
        else {
            if(block != nil){
                SKTResult result = SKTCaptureE_INVALIDHANDLE;
                NSString* response = [JsonRpcTransport returnJsonRpcWithError:result withMessage:@"handle is not the main Capture object" withId:jsonRpcId];
                block(response);
            }
        }
    }
    else if ([method  isEqual: @"close"]){
        params = [jsonRpc objectForKey:@"params"];
        NSInteger handle = [[params objectForKey:@"handle"] integerValue];
        if(handle == (int)_capture){
            [_capture closeWithCompletionHandler:^(SKTResult result) {
                NSString* response;
                NSLog(@"Closing Capture returns: %ld", result);
                if(SKTSUCCESS(result)){
                    response = [JsonRpcTransport returnJsonRpcWithId:jsonRpcId];
                }
                else{
                    response = [JsonRpcTransport returnJsonRpcWithError:result withMessage:@"failed to close Capture" withId:jsonRpcId];
                }
                self->_captureOpened = false;
                if(block != nil){
                    block(response);
                }
            }];
        }
        else if([self GetDeviceWithHandle: handle] != nil) {
            SKTCapture* device =[self RemoveDeviceWithHandle: handle];
            [device closeWithCompletionHandler:^(SKTResult result) {
                NSString* response;
                if(SKTSUCCESS(result)){
                    response = [JsonRpcTransport returnJsonRpcWithId:jsonRpcId];
                }
                else{
                    response = [JsonRpcTransport returnJsonRpcWithError:result withMessage:@"failed to close the device" withId:jsonRpcId];
                }
                if(block != nil){
                    block(response);
                }
            }];
        }
        else {
            if(block != nil){
                SKTResult result = SKTCaptureE_NOTFOUND;
                NSString* response = [JsonRpcTransport returnJsonRpcWithError:result withMessage:@"failed to close unknown handle" withId:jsonRpcId];
                block(response);
            }
        }
    }
    else if ([method  isEqual: @"getproperty"]){
        params = [jsonRpc objectForKey:@"params"];
        NSDictionary* jsonRpcProperty = [params objectForKey:@"property"];
        NSInteger handle = [[params objectForKey:@"handle"] integerValue];
        SKTCaptureProperty* property;
        SKTCapture* object = nil;
        if(handle == 0){
            NSException *exception = [NSException
                        exceptionWithName:@"JsonParsingException"
                        reason:@"missing handle in params"
                        userInfo:nil];
            @throw exception;
        }
        if((int)handle == (int)_capture){
            object = _capture;
        }
        else if( [self GetDeviceWithHandle:handle] != nil){
            object = [self GetDeviceWithHandle:handle];
        }
        else {
            if(block != nil){
                SKTResult result = SKTCaptureE_INVALIDHANDLE;
                NSString* response = [JsonRpcTransport returnJsonRpcWithError:result withMessage:@"handle is not the main Capture or a Device" withId:jsonRpcId];
                block(response);
            }
            return;
        }
        property = [JsonRpcTransport ConvertToPropertyFromJsonRpcProperty:jsonRpcProperty];
        [object getProperty:property completionHandler:^(SKTResult result, SKTCaptureProperty *property) {
            NSString* response;
            if(SKTSUCCESS(result)){
                response = [JsonRpcTransport returnJsonRpcWithHandle:handle withProperty: property withId:jsonRpcId];
            }
            else {
                response = [JsonRpcTransport returnJsonRpcWithError:result withMessage:@"failed to get a property" withId:jsonRpcId];
            }
            if(block != nil){
                block(response);
            }
        }];
        
    }
    else if ([method  isEqual: @"setproperty"]){
        params = [jsonRpc objectForKey:@"params"];
        NSDictionary* jsonRpcProperty = [params objectForKey:@"property"];
        NSInteger handle = [[params objectForKey:@"handle"] integerValue];
        SKTCaptureProperty* property;
        SKTCapture* object = nil;
        if(handle == 0){
            NSException *exception = [NSException
                        exceptionWithName:@"JsonParsingException"
                        reason:@"missing handle in params"
                        userInfo:nil];
            @throw exception;
        }
        if((int)handle == (int)_capture){
            object = _capture;
        }
        else if( [self GetDeviceWithHandle:handle] != nil){
            object = [self GetDeviceWithHandle:handle];
        }
        else {
            if(block != nil){
                SKTResult result = SKTCaptureE_INVALIDHANDLE;
                NSString* response = [JsonRpcTransport returnJsonRpcWithError:result withMessage:@"handle is not the main Capture or a Device" withId:jsonRpcId];
                block(response);
            }
            return;
        }
        property = [JsonRpcTransport ConvertToPropertyFromJsonRpcProperty:jsonRpcProperty];
        [object setProperty:property completionHandler:^(SKTResult result, SKTCaptureProperty *property) {
            NSString* response;
            if(SKTSUCCESS(result)){
                response = [JsonRpcTransport returnJsonRpcWithHandle:handle withProperty: property withId:jsonRpcId];
            }
            else {
                response = [JsonRpcTransport returnJsonRpcWithError:result withMessage:@"failed to get a property" withId:jsonRpcId];
            }
            if(block != nil){
                block(response);
            }
        }];
        
    }
    else if ([method  isEqual: @"waitforevent"]){
    }
    else if ([method  isEqual: @"waitforcaptureobject"]){
        
    }
    else {
        NSException* exception = [NSException
                                  exceptionWithName:@"JSONRPC method"
                                  reason:[NSString stringWithFormat:@"unknown method %@",method]
                                  userInfo: nil];
        @throw exception;
    }
}

#pragma mark - JSON Static conversion methods

+(id) ParseFromJson:(NSString*)jsonRpc {
    NSData *jsonData = [jsonRpc dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error;

    //    Note that JSONObjectWithData will return either an NSDictionary or an NSArray, depending whether your JSON string represents an a dictionary or an array.
   id jsonObject = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&error];
    if(error != nil) {
        NSException* exception = [NSException
                                  exceptionWithName:@"JSON Parser fault"
                                  reason:[error localizedDescription]
                                  userInfo: [error userInfo]];
        @throw exception;
    }
    if ([jsonObject isKindOfClass:[NSArray class]])
     {
         NSLog(@"it is an array!");
         NSArray *jsonArray = (NSArray *)jsonObject;
         NSLog(@"jsonArray - %@",jsonArray);
         return jsonArray;
     }
     else {
         NSLog(@"it is a dictionary");
         NSDictionary *jsonDictionary = (NSDictionary *)jsonObject;
         NSLog(@"jsonDictionary - %@",jsonDictionary);
         return jsonDictionary;
     }
}


+(NSString*)returnJsonRpcWithHandle:(NSInteger)handle withId:(NSInteger)jsonRpcId{
    return [NSString stringWithFormat:@"{\"jsonrpc\":\"2.0\",\"result\":{\"handle\":%ld},\"id\":%ld}",handle, jsonRpcId];
}

+(NSString*)returnJsonRpcWithId:(NSInteger)jsonRpcId{
    return [NSString stringWithFormat:@"{\"jsonrpc\":\"2.0\",\"result\": 0,\"id\":%ld}", jsonRpcId];
}

+(NSString*)returnJsonRpcWithError:(NSInteger)error withMessage:(NSString*)message withId:(NSInteger)jsonRpcId{
    return [NSString stringWithFormat:@"{\"jsonrpc\":\"2.0\",\"error\":{\"code\":%ld,\"message\":\"%@\"},\"id\":%ld}",error, message, jsonRpcId];
}

+(NSString*)returnJsonRpcWithHandle:(NSInteger)handle withProperty:(SKTCaptureProperty*) property withId:(NSInteger)jsonRpcId {
    NSString* jsonProperty = [JsonRpcTransport ConvertToJsonRpcPropertyFromProperty:property];
    NSString* jsonRpc;
    jsonRpc = [NSString stringWithFormat:@"{\"jsonrpc\":\"2.0\",\"result\":{\"handle\":%ld, \"property\":%@ },\"id\":%ld}",handle, jsonProperty,jsonRpcId];
    return jsonRpc;
}


+(SKTCaptureProperty*)ConvertToPropertyFromJsonRpcProperty:(NSDictionary*) jsonRpcProperty {
    NSDictionary* version;
    NSDictionary* dataSource;
    SKTCaptureProperty* property = [SKTCaptureProperty new];
    property.ID = [[jsonRpcProperty objectForKey:@"id"] integerValue];
    property.Type = [[jsonRpcProperty objectForKey:@"type"] integerValue];
    switch(property.Type) {
        case SKTCapturePropertyTypeNone:
            break;
        case SKTCapturePropertyTypeByte:
            property.ByteValue = [[jsonRpcProperty objectForKey:@"value"] integerValue];
            break;
        case SKTCapturePropertyTypeUlong:
            property.ULongValue = [[jsonRpcProperty objectForKey:@"value"] integerValue];
            break;
        case SKTCapturePropertyTypeArray:
            property.ArrayValue = [jsonRpcProperty objectForKey:@"value"];
            break;
        case SKTCapturePropertyTypeString:
            property.StringValue = [jsonRpcProperty objectForKey:@"value"];
            break;
        case SKTCapturePropertyTypeVersion:
            version = [jsonRpcProperty objectForKey: @"value"];
            property.Version.Major = [[version objectForKey: @"major"] integerValue];
            property.Version.Middle = [[version objectForKey: @"middle"] integerValue];
            property.Version.Minor = [[version objectForKey: @"minor"] integerValue];
            property.Version.Build = [[version objectForKey: @"build"] integerValue];
            property.Version.Year = (int)[[version objectForKey: @"year"] integerValue];
            property.Version.Month = (int)[[version objectForKey: @"month"] integerValue];
            property.Version.Hour = (int)[[version objectForKey: @"hour"] integerValue];
            property.Version.Minute = (int)[[version objectForKey: @"minute"] integerValue];
            break;
        case SKTCapturePropertyTypeDataSource:
            dataSource = [jsonRpcProperty objectForKey: @"dataSource"];
            property.DataSource.ID = [[dataSource objectForKey:@"id"] integerValue];
            property.DataSource.Flags = [[dataSource objectForKey:@"flags"] integerValue];
            property.DataSource.Name = [dataSource objectForKey:@"name"];
            property.DataSource.Status = [[dataSource objectForKey:@"status"] integerValue];
            break;
        case SKTCapturePropertyTypeEnum:
            break;
        case SKTCapturePropertyTypeObject:
            break;
        case SKTCapturePropertyTypeNotApplicable:
        case SKTCapturePropertyTypeLastType:
            break;
    }
    return property;
}

/**
 Convert a property into a JSON String
 */
+(NSString*)ConvertToJsonRpcPropertyFromProperty:(SKTCaptureProperty*) property {
    NSMutableString* jsonRpc = [NSMutableString stringWithFormat: @"{ \"id\": %ld, \"type\": %ld,",property.ID, property.Type];
    switch(property.Type) {
        case SKTCapturePropertyTypeNone:
            [jsonRpc appendString:@"}"];
            break;
        case SKTCapturePropertyTypeByte:
            [jsonRpc appendFormat:@"\"value\": %d }",property.ByteValue];
            break;
        case SKTCapturePropertyTypeUlong:
            [jsonRpc appendFormat:@"\"value\": %ld }",property.ULongValue];
            break;
        case SKTCapturePropertyTypeArray:
            [jsonRpc appendFormat:@"\"value\": %@ }", [JsonRpcTransport ConvertToStringFromData:property.ArrayValue]];
            break;
        case SKTCapturePropertyTypeString:
            [jsonRpc appendFormat:@"\"value\": \"%@\" }",property.StringValue];
            break;
        case SKTCapturePropertyTypeVersion:
            [jsonRpc appendString:@"\"value\": {"];
            [jsonRpc appendFormat:@"\"major\": %ld,",property.Version.Major];
            [jsonRpc appendFormat:@"\"middle\": %ld,",property.Version.Middle];
            [jsonRpc appendFormat:@"\"minor\": %ld,",property.Version.Minor];
            [jsonRpc appendFormat:@"\"build\": %ld,",property.Version.Build];
            [jsonRpc appendFormat:@"\"year\": %d,",property.Version.Year];
            [jsonRpc appendFormat:@"\"month\": %d,",property.Version.Month];
            [jsonRpc appendFormat:@"\"hour\": %d,",property.Version.Hour];
            [jsonRpc appendFormat:@"\"minute\": %d",property.Version.Minute];
            [jsonRpc appendString:@"} }"];
            break;
        case SKTCapturePropertyTypeDataSource:
            [jsonRpc appendString:@"\"value\": {"];
            [jsonRpc appendFormat:@"\"id\": %ld,",property.DataSource.ID];
            [jsonRpc appendFormat:@"\"flags\": %ld,",property.DataSource.Flags];
            [jsonRpc appendFormat:@"\"name\": \"%@\",",property.DataSource.Name];
            [jsonRpc appendFormat:@"\"status\": %ld",property.DataSource.Status];
            [jsonRpc appendString:@"} }"];
            break;
        case SKTCapturePropertyTypeObject:
        case SKTCapturePropertyTypeNotApplicable:
        case SKTCapturePropertyTypeLastType:
        case SKTCapturePropertyTypeEnum:
            [jsonRpc appendString:@"}"];
            break;
    }
    return jsonRpc;
}

+(NSString*)ConvertToJsonRpcEventFromEvent:(SKTCaptureEvent*)event fromCapture:(SKTCapture*)capture {
    NSMutableString* json = [NSMutableString stringWithFormat:@"{\"handle\": %d, \"event\":{ \"id\": %ld, \"type\": %ld",(int)capture, (long)event.ID, (long)event.Data.Type];
    switch(event.Data.Type){
            
        case SKTCaptureEventDataTypeNone:
            [json appendString:@"}}"];
            break;
        case SKTCaptureEventDataTypeByte:
            [json appendFormat:@", \"value\": %d }}", event.Data.ByteValue];
            break;
        case SKTCaptureEventDataTypeUlong:
            [json appendFormat:@", \"value\": %lu }}", event.Data.ULongValue];
            break;
        case SKTCaptureEventDataTypeArray:
            [json appendFormat:@", \"value\": %@ }}", [JsonRpcTransport ConvertToStringFromData:event.Data.ArrayValue]];
            break;
        case SKTCaptureEventDataTypeString:
            [json appendFormat:@", \"value\": \"%@\" }}", event.Data.StringValue];
            break;
        case SKTCaptureEventDataTypeDecodedData:
            [json appendString:@", \"value\": {"];
            [json appendFormat:@"\"data\": %@,", [JsonRpcTransport ConvertToStringFromData:event.Data.DecodedData.DecodedData]];
            [json appendFormat:@"\"id\": %ld,", (long)event.Data.DecodedData.DataSourceID];
            [json appendFormat:@"\"name\": \"%@\"}}}", event.Data.DecodedData.DataSourceName];
            break;
        case SKTCaptureEventDataTypeDeviceInfo:
            [json appendString:@", \"value\": {"];
            [json appendFormat:@"\"type\": %ld, ",event.Data.DeviceInfo.DeviceType];
            [json appendFormat:@"\"guid\": \"%@\", ",event.Data.DeviceInfo.Guid];
            [json appendFormat:@"\"name\": \"%@\"",event.Data.DeviceInfo.Name];
            if(event.Data.DeviceInfo.Handle > 0){
                [json appendFormat:@", \"handle\": %ld}}}",(long)event.Data.DeviceInfo.Handle];
            }
            else {
                [json appendString:@"}}}"];
            }
            break;
        case SKTCaptureEventDataTypeLastID:
            [json appendString:@"}}"];
            break;
    }
    return json;
}

+(NSString*) ConvertToStringFromData:(NSData*)data {
    NSMutableString* stringData = [NSMutableString stringWithString:@"["];
    const char* bytes = data.bytes;
    for(int i = 0; i < data.length; i++){
        if(i == 0){
            [stringData appendFormat:@"%d", bytes[i]];
        }
        else {
            [stringData appendFormat:@",%d", bytes[i]];
        }
    }
    [stringData appendString:@"]"];
    return stringData;
}
#pragma mark - Capture Helper Notifications


/**
 @brief this delegate is called each time an event is received from Capture

 @param event contains the event received
 @param capture contains a reference to the Capture object for which the event
 @param result contains the result of receiving this event
 */
-(void) didReceiveEvent:(SKTCaptureEvent*) event forCapture:(SKTCapture*) capture withResult:(SKTResult) result{
    if(_hasListeners == NO){
        return;
    }
    NSString* jsonEvent = [JsonRpcTransport ConvertToJsonRpcEventFromEvent: event fromCapture: capture];
    NSString* rpcEvent = [NSString stringWithFormat:@"{\"jsonrpc\": \"2.0\", \"result\":%@}",jsonEvent];
    [self sendEventWithName:@"onCaptureEvent" body:rpcEvent];
}

#pragma mark - utility methods
-(SKTCapture*) GetDeviceWithHandle:(NSInteger)handle {
    if(_devices != nil){
        NSString* handleValue = [NSString stringWithFormat:@"%d", (int)handle];
        return (SKTCapture*)[_devices valueForKey:handleValue];
    }
    return nil;
}

-(SKTCapture*) RemoveDeviceWithHandle:(NSInteger)handle {
    if(_devices != nil){
        NSString* handleValue = [NSString stringWithFormat:@"%d", (int)handle];
        SKTCapture* device = (SKTCapture*)[_devices valueForKey:handleValue];
        [_devices removeObjectForKey:handleValue];
        return device;
    }
    return nil;
}

@end
