#import "AppDelegate.h"
#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Always configure FIRApp so the JS firebase modules (analytics/crashlytics/firestore) can resolve [FIRApp defaultApp].
  // When GoogleService-Info.plist contains placeholder values, configure will succeed but network calls will fail server-side — that's fine in dev.
  @try {
    if ([FIRApp defaultApp] == nil) {
      [FIRApp configure];
    }
  } @catch (NSException *e) {
    NSLog(@"[Firebase] configure failed: %@", e.reason);
  }
  self.moduleName = @"MiroLang";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
