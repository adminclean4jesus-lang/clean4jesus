# Release Checklist Clean4Jesus

## Antes De Un APK De Prueba

- [ ] Leer `docs/DIRECTIVAS-CLEAN4JESUS.md`
- [ ] Confirmar que no se toca ningun checkpoint congelado sin permiso
- [ ] Ejecutar red team adversarial
- [ ] Ejecutar:
  - [ ] `npx tsc --noEmit`
  - [ ] `npm run test:unit`
  - [ ] `npm run test:e2e`
  - [ ] `npx expo export --platform web --clear`
- [ ] Recorrer manualmente la pantalla cambiada
- [ ] Confirmar version visible y version nativa
- [ ] Confirmar que el APK ira a `artifacts/apk/current`

## Antes De Produccion Real

- [ ] PIN fuera de almacenamiento plano
- [ ] `allowBackup` validado
- [ ] firma release real, no debug keystore
- [ ] versionado sincronizado
- [ ] README y onboarding tecnico actualizados
- [ ] privacidad y permisos revisados
- [ ] artefactos temporales limpiados
