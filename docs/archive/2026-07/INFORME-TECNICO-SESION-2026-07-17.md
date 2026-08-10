# Informe Tecnico De Sesion - Clean4Jesus

**Fecha:** 17 de julio de 2026  
**Version del proyecto:** 1.3.6  
**Foco de la sesion:** endurecer el comportamiento del PIN en bloqueos por falso positivo  
**Estado final:** ajuste aplicado, validado y documentado; no se genero APK nuevo en esta sesion.

---

## 1. Resumen Ejecutivo

Hoy no hicimos una sesion grande de nuevas funciones. Hicimos algo mas pequeno, pero muy importante para el corazon del producto.

Detectamos que, cuando la app bloqueaba algo y la persona usaba el PIN diciendo que era un falso positivo, Clean4Jesus dejaba una ventana demasiado amplia. Esa ventana podia durar varios minutos. En una persona con impulso fuerte, varios minutos son suficientes para caer.

Por eso cambiamos la logica para que el PIN de falso positivo ya no abra una puerta grande. Ahora solo abre una puerta muy corta y solo para ese caso exacto.

En palabras simples:

- antes: el desbloqueo por falso positivo era demasiado permisivo;
- ahora: el desbloqueo por falso positivo dura solo **20 segundos**;
- ademas: solo sirve para **ese incidente exacto**, no para apagar el refugio completo.

La idea del cambio fue pensar como piensa una persona en vulnerabilidad real, no como un sistema teorico.

## 2. Cual Era El Problema

El problema no era que el PIN existiera. El problema era **cuanto margen daba**.

Si un usuario:

1. ve una pantalla bloqueada,
2. pone el PIN,
3. y recibe varios minutos libres,

entonces el PIN deja de ser una herramienta para corregir errores y se convierte en una forma de saltarse la proteccion.

Eso contradice la razon de ser de Clean4Jesus.

Tambien quedo claro algo importante de producto: un falso positivo real si necesita una salida breve, porque a veces la app puede bloquear algo inocente. Pero esa salida tiene que ser tan corta que sirva para corregir el error, no para consumir contenido riesgoso.

## 3. Que Se Cambio Exactamente

### 3.1 Cambio en Android nativo

Se modifico la actividad nativa que muestra la pantalla de interrupcion:

`android/app/src/main/java/com/clean4jesus/app/InterruptionActivity.kt`

Antes, la aprobacion de un falso positivo duraba varios minutos.  
Ahora dura:

`20_000L`

Eso equivale a **20 segundos**.

### 3.2 El Refugio sigue activo

No se apaga el Refugio completo.

Esto es clave.

Cuando el usuario marca que fue un error:

- no se libera la proteccion global;
- no se abre un hueco general de 15 minutos;
- solo se concede un permiso temporal minimo para **ese incidente exacto**.

Si luego aparece otro contenido distinto y sensible, el Refugio vuelve a actuar normalmente.

### 3.3 La excepcion no es general

La excepcion se guarda con una huella local del incidente, no como una liberacion completa de la app o del sistema.

En lenguaje sencillo:

- no dice "deja pasar todo";
- dice "deja pasar este caso concreto por unos segundos".

Eso reduce mucho el riesgo de abuso.

## 4. Que No Cambiamos

Hoy **no** tocamos:

- la logica general del Refugio;
- la VPN;
- la Accesibilidad;
- los allowlists de bancos o YouTube;
- Palabra;
- Comunidad;
- el footer;
- Planes;
- la arquitectura de login;
- Supabase.

Esto fue intencional. La sesion se mantuvo muy enfocada para no romper checkpoints que ya estan funcionando.

## 5. Pruebas Que Se Corrieron

No nos quedamos solo con el cambio en codigo. Tambien lo validamos.

### 5.1 Suite unitaria

Se ejecuto la suite unitaria completa y aprobo:

- **18 archivos de prueba**
- **101 pruebas**
- **101 aprobadas**

Eso nos da confianza en que el ajuste no rompio los contratos ya existentes del modulo nativo.

## 6. Duda Importante Que Quedo Respondida

Tambien quedo aclarado por que la pantalla de bloqueo sale negra al intentar tomar captura.

Eso no es un bug casual.  
Se debe a:

`FLAG_SECURE`

Esa bandera de Android evita capturas y grabaciones de esa pantalla.

La razon es proteger:

- la imagen personalizada;
- el texto personal;
- el motivo del bloqueo;
- el campo del PIN.

En otras palabras: la app esta priorizando privacidad y seguridad visual.

## 7. Por Que Este Cambio Si Tiene Sentido De Producto

Este ajuste esta mucho mas alineado con el usuario real de Clean4Jesus.

No estamos construyendo una app para un usuario frio y racional en todo momento. Estamos construyendo para personas que, en ciertos instantes, pueden actuar por impulso.

Eso cambia completamente el criterio de producto.

Por eso, un desbloqueo de 5 o 15 minutos para un falso positivo no era aceptable.  
Un desbloqueo de 20 segundos es mucho mas razonable porque:

- da salida a un error;
- no regala una ventana peligrosa;
- mantiene la filosofia de refugio activo;
- reduce la posibilidad de usar el PIN como bypass.

## 8. Siguientes Pasos Recomendados

La siguiente sesion deberia enfocarse en este orden:

1. Probar en APK este ajuste de 20 segundos en telefono real.
2. Seguir reduciendo falsos positivos como palabras inocentes o combinaciones raras.
3. Terminar de pulir la personalizacion de la pantalla de bloqueo.
4. Retomar el roadmap previo a beta con esta base ya mas solida.

## 9. Conclusion

Hoy no avanzamos en cantidad de modulos, pero si mejoramos una decision critica del producto.

El resultado final es este:

- el PIN para falsos positivos ya no deja una brecha amplia;
- el Refugio sigue siendo el sistema principal;
- la excepcion es corta, exacta y pensada para corregir errores, no para permitir una recaida;
- las pruebas automaticas siguieron en verde.

En resumen: **se hizo a Clean4Jesus mas coherente con la realidad de una persona vulnerable.**
