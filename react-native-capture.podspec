require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "react-native-capture"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = "React Native Capture, integrating the iOS CaptureSDK"
  s.homepage     = "https://socketmobile.com"
  s.license      = "MIT"
  s.authors      = { "Socket Mobile" => "developers@socketmobile.com" }
  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/SocketMobile/react-native-capture.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,c,m,mm,swift}"
  s.requires_arc = true

  s.dependency 'CaptureSDK', '~>1.9.166'

  # Use install_modules_dependencies helper to install the dependencies if React Native version >=0.71.0.
  # See https://github.com/facebook/react-native/blob/febf6b7f33fdb4904669f99d795eba4c0f95d7bf/scripts/cocoapods/new_architecture.rb#L79.
  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"
  end

end
