# Acciones finales de la persona titular para la candidata beta 1.3.37

Fecha de corte: 16 de septiembre de 2026. Esta hoja contiene únicamente tareas que requieren dispositivo físico, cuentas de tienda, custodia de claves o aprobación humana. La ingeniería automatizable de esta sesión ya fue ejecutada.

La APK `1.3.37 (55)` fue compilada con Gradle local, aprobó lint nativo, fue verificada criptográficamente y queda destinada solo a QA interna con Metro. SHA-256: `C38B8714C28C9F5003A91E4297F80800464CCD9916E06412BD30FDB7AB2E1701`. Certificado debug SHA-256: `3B8E9BCA44BD9E013D66E36A8B1BF0E44E932191DDA0580EE70D734C22C5DBB5`.

## 1. Tus pruebas Android

- [ ] Instalar `artifacts/apk/current/Clean4Jesus-current.apk` en el Pixel. Ejecutar Metro desde `C:\c4j\beta-1.3.37` con `npm run dev-client`; si falla la red local, usar `npm run dev-client:tunnel`.
- [ ] Probar en Wi-Fi y datos móviles: VPN, Accesibilidad, búsqueda de un dominio adulto, página de interrupción, PIN, WhatsApp/Business OFF por defecto y opt-in, bancos/YouTube sin bloqueo, reinicio y pérdida de red.
- [ ] Verificar específicamente DNS-over-TLS: la navegación normal funciona, el dominio adulto se bloquea y, si el upstream falla repetidamente, la protección vuelve a estado inactivo sin dejar el teléfono sin red indefinidamente.
- [ ] Durante un desbloqueo deliberado de 15 minutos, abrir contenido adulto distinto en esa app: el análisis visible debe seguir interrumpiéndolo.
- [ ] Repetir la matriz en un Android de otro fabricante y registrar modelo, Android, red, versión, pasos y resultado.
- [ ] Con una cuenta desechable, probar “Eliminar cuenta” dentro de la app completando el CAPTCHA real. Esta última parte no puede automatizarse porque Turnstile emite tokens de un solo uso en el cliente.

## 2. Tus pruebas de correo y operación

- [ ] Con dos cuentas de prueba consentidas, aceptar el modo acompañado, enviar la invitación y confirmar la entrega real.
- [ ] Desactivar la protección y comprobar que llega un solo aviso genérico después del periodo de gracia y del cron; no debe revelar apps, contenido ni navegación.
- [ ] Confirmar en Supabase Dashboard que los cron `clean4jesus-accountability-health-dispatch` y `clean4jesus-privacy-retention` están ejecutándose sin error.
- [ ] Activar MFA en cada cuenta moderadora y realizar un simulacro documentado de reporte, escalamiento y crisis según `MODERATION-RUNBOOK.md`.

Las migraciones de seguridad y retención ya están aplicadas en producción; `report-false-positive`, `accountability`, `accountability-health` y `delete-account` ya fueron desplegadas; las suites remotas positivas y negativas aprobaron.

## 3. Tus tareas iPhone y tiendas

- [ ] Revisar y aprobar el diff de la candidata antes de hacer commit/push y abrir el PR contra `main`.
- [ ] Ejecutar el workflow iOS en GitHub/macOS para `1.3.37 (27)`, revisar firma y entitlements de la app y sus cuatro extensiones, y subir la IPA a TestFlight.
- [ ] En iPhone real, completar `IOS-DEVICE-QA-MATRIX.md`: PIN ante deep links, selección con protección activa, límites independientes, Shield, permiso revocado y estados de “Uso de hoy”.
- [ ] Crear y custodiar fuera de Git la clave release Android definitiva, activar Play App Signing y generar el AAB release local. No usar el certificado debug del APK de QA.
- [ ] Revisar con asesoría legal colombiana privacidad, términos, edad, comunidad, eliminación, licencias bíblicas, disclosures de VPN/Accesibilidad, Data Safety y App Privacy.
- [ ] Aprobar fichas, capturas y copy reales de Play Store/App Store antes de invitar testers externos.

## 4. Decisión pendiente de dependencias

- [ ] Autorizar una rama separada para actualizar Expo/React Native y resolver el inventario de `npm audit`: 34 vulnerabilidades transitivas (`16` altas, `18` moderadas). No ejecutar `npm audit fix --force` sobre esta candidata; la actualización requiere regresión Android/iPhone.

La beta externa continúa en **NO-GO** hasta cerrar estas casillas. Sí existe **GO para QA interna supervisada** de `1.3.37 (55)`.
