Pod::Spec.new do |s|
  s.name           = 'Clean4JesusIosProtection'
  s.version        = '1.0.0'
  s.summary        = 'Módulo nativo Swift de protección iOS para Clean4Jesus'
  s.description    = 'Integración de Family Controls, Managed Settings y Device Activity para Clean4Jesus'
  s.author         = 'Clean4Jesus'
  s.homepage       = 'https://clean4jesus.com'
  s.platform       = :ios, '16.0'
  s.source         = { :git => '' }
  s.source_files   = '**/*.{h,m,swift}'
  s.swift_version  = '5.0'

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'FamilyControls', 'ManagedSettings', 'DeviceActivity'
end
