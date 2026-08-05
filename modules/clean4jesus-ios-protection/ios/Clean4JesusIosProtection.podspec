Pod::Spec.new do |s|
  s.name           = 'Clean4JesusIosProtection'
  s.version        = '1.0.0'
  s.summary        = 'Native iOS protection for Clean4Jesus'
  s.description    = 'Family Controls and Managed Settings bridge for Clean4Jesus.'
  s.license        = { :type => 'Proprietary' }
  s.author         = 'Clean4Jesus'
  s.homepage       = 'https://clean4jesus.com'
  s.platforms      = { :ios => '16.0' }
  s.source         = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files   = '**/*.{h,m,mm,swift}'
  s.swift_version  = '5.9'
  s.frameworks     = 'DeviceActivity', 'FamilyControls', 'ManagedSettings', 'SwiftUI', 'UIKit'
end
