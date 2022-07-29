require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-capture"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = "React Native Capture, integrating the iOS Capture SDK"
  s.homepage     = "https://socketmobile.com"
  # brief license entry:
  s.license      = "MIT"
  # optional - use expanded license entry instead:
  # s.license    = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "Socket Mobile" => "developers@socketmobile.com" }
  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/SocketMobile/react-native-capture.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,c,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  # ...
  s.dependency "CaptureSDK", "~>1.4"
end

