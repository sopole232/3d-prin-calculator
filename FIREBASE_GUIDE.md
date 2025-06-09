# 🚀 Guía Completa de Configuración Firebase

Esta guía te ayudará a configurar la sincronización en la nube para tu aplicación de impresión 3D usando Firebase.

## 📋 Resumen Rápido

1. **Crear proyecto Firebase** → [Firebase Console](https://console.firebase.google.com)
2. **Configurar Authentication** → Habilitar Email/Password
3. **Configurar Firestore Database** → Crear base de datos
4. **Obtener credenciales** → Configuración del proyecto
5. **Configurar en la app** → Pestaña Configuración > Sincronización en la Nube

---

## 🔥 Paso 1: Crear Proyecto Firebase

### 1.1 Ir a Firebase Console
- Visita [https://console.firebase.google.com](https://console.firebase.google.com)
- Inicia sesión con tu cuenta de Google
- Haz clic en **"Crear un proyecto"**

### 1.2 Configurar el proyecto
```
Nombre del proyecto: MiApp-Impresion3D (o el que prefieras)
País/región: España (o tu ubicación)
```

### 1.3 Configurar Google Analytics (opcional)
- Puedes deshabilitarlo si no lo necesitas
- Si lo habilitas, acepta los términos

---

## 🔐 Paso 2: Configurar Authentication

### 2.1 Ir a Authentication
1. En el panel izquierdo, haz clic en **"Authentication"**
2. Ve a la pestaña **"Sign-in method"**
3. Haz clic en **"Email/Password"**

### 2.2 Habilitar Email/Password
```
✅ Habilitar Email/Password
❌ Deshabilitar Email link (passwordless sign-in)
```
- Haz clic en **"Guardar"**

### 2.3 (Opcional) Configurar dominios autorizados
- En la pestaña **"Settings"** > **"Authorized domains"**
- Agrega tus dominios si usas hosting personalizado
- Para GitHub Pages: `tunombre.github.io`

---

## 🗄️ Paso 3: Configurar Firestore Database

### 3.1 Crear base de datos
1. En el panel izquierdo, haz clic en **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**

### 3.2 Configurar reglas de seguridad
Elige **"Comenzar en modo de prueba"** (recomendado para empezar):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura solo a usuarios autenticados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3.3 Configurar ubicación
- Elige **"eur3 (europe-west)"** para Europa
- O la región más cercana a tus usuarios

---

## ⚙️ Paso 4: Obtener Credenciales

### 4.1 Crear aplicación web
1. En **"Descripción general del proyecto"**, haz clic en el ícono **"Web" (`</>`)**
2. Introduce un nombre: `impresion3d-webapp`
3. **NO** marques "Firebase Hosting" (a menos que lo uses)
4. Haz clic en **"Registrar app"**

### 4.2 Copiar configuración
Verás algo así:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

### 4.3 Guardar credenciales
**¡IMPORTANTE!** Copia estos valores, los necesitarás en el siguiente paso.

---

## 🔧 Paso 5: Configurar en la Aplicación

### 5.1 Abrir la aplicación
1. Ve a tu aplicación web
2. Haz clic en la pestaña **"⚙️ Configuración"**
3. Busca la sección **"☁️ Sincronización en la Nube"**

### 5.2 Introducir credenciales
Completa todos los campos con los valores obtenidos en el paso anterior:

| Campo | Ejemplo | Tu valor |
|-------|---------|----------|
| **API Key** | `AIzaSyXXXXXX...` | |
| **Auth Domain** | `tu-proyecto.firebaseapp.com` | |
| **Project ID** | `tu-proyecto-id` | |
| **Storage Bucket** | `tu-proyecto.appspot.com` | |
| **Messaging Sender ID** | `123456789012` | |
| **App ID** | `1:123456789012:web:abcdef...` | |

### 5.3 Guardar y conectar
1. Haz clic en **"💾 Guardar Configuración"**
2. Haz clic en **"🔥 Conectar Firebase"**
3. Deberías ver: **"🟡 Firebase conectado - Falta autenticación"**

---

## 👤 Paso 6: Crear Usuario

### 6.1 Registrar cuenta
1. Introduce tu **email** y **contraseña** (mínimo 6 caracteres)
2. Haz clic en **"👤 Registrar Usuario"**
3. Deberías ver: **"🟢 Conectado y autenticado"**

### 6.2 ¡Listo para sincronizar!
Ahora puedes usar los botones:
- **📤 Subir Datos Locales** - Envía tus datos actuales a la nube
- **📥 Descargar de la Nube** - Recibe datos desde la nube
- **🔄 Sincronizar Ahora** - Sincronización manual

---

## 🔄 Uso Diario

### Primer dispositivo (donde tienes los datos)
1. **📤 Subir Datos Locales** para enviar todo a la nube

### Otros dispositivos
1. **📥 Descargar de la Nube** para recibir todos los datos
2. Usa normalmente la aplicación
3. Los cambios se sincronizan automáticamente

### Sincronización automática
- Los datos se sincronizan automáticamente cuando haces cambios
- Si hay conflictos, la app te preguntará qué hacer
- Siempre tienes respaldo local y en la nube

---

## 🚨 Solución de Problemas

### Error: "Firebase SDK no está cargado"
- Verifica tu conexión a internet
- Recarga la página
- Comprueba que los scripts de Firebase se cargan correctamente

### Error: "API key not valid"
- Revisa que copiaste correctamente la API Key
- Verifica que el proyecto existe en Firebase Console

### Error: "User not authenticated"
- Haz clic en **"🔐 Iniciar Sesión"** con tu email/contraseña
- Si olvidaste la contraseña, puedes recuperarla desde Firebase Console

### Error: "Permission denied"
- Verifica las reglas de Firestore
- Asegúrate de estar autenticado
- Comprueba que el Project ID es correcto

### Los datos no se sincronizan
1. Verifica el estado: debe ser **"🟢 Conectado y autenticado"**
2. Prueba **"🔄 Sincronizar Ahora"** manualmente
3. Revisa la consola del navegador (F12) para errores

---

## 📊 Gestión de Datos

### Migración desde localStorage
Si ya tienes datos locales:
1. Configura Firebase siguiendo esta guía
2. Haz clic en **"📤 Subir Datos Locales"**
3. Tus datos locales se copiarán a la nube
4. En otros dispositivos, usa **"📥 Descargar de la Nube"**

### Backup y restauración
- **Exportar:** Usa el botón "📤 Exportar Datos" para backup local
- **Importar:** Usa "📥 Importar Datos" para restaurar desde archivo
- **Nube:** Firebase mantiene automáticamente backups

---

## 🔒 Seguridad y Privacidad

### Tus datos están seguros
- ✅ **Encriptación:** Todos los datos se transmiten cifrados (HTTPS)
- ✅ **Autenticación:** Solo tú puedes acceder a tus datos
- ✅ **Aislamiento:** Cada usuario tiene su espacio privado
- ✅ **Backup:** Firebase mantiene múltiples copias de seguridad

### Datos almacenados
La app sincroniza:
- 📦 Lista de filamentos y precios
- 🖨️ Perfiles de impresoras
- 📊 Histórico de cálculos
- ⚙️ Configuraciones personales

### Lo que NO se almacena
- ❌ Contraseñas (solo el hash de autenticación)
- ❌ Datos personales innecesarios
- ❌ Archivos de impresión (.gcode, .stl)

---

## 💡 Consejos y Trucos

### Para múltiples dispositivos
1. **Configura el primer dispositivo** completamente
2. **Sube los datos** desde el dispositivo principal
3. En **otros dispositivos:** solo descarga y usa

### Conflictos de sincronización
- Si modificas datos en dos dispositivos simultáneamente
- La app te preguntará qué versión conservar
- Siempre puedes hacer backup manual antes de sincronizar

### Optimización
- La app sincroniza automáticamente cada pocos minutos
- Solo se envían los cambios, no todos los datos
- Funciona sin conexión; sincroniza al reconectar

---

## 📞 Soporte

### Si necesitas ayuda
1. **Revisa esta guía** completa
2. **Comprueba la consola** del navegador (F12) para errores técnicos
3. **Prueba en modo incógnito** para descartar extensiones
4. **Verifica tu conexión** a internet

### Información técnica
- **Firebase Version:** 9.22.0
- **Database:** Cloud Firestore
- **Authentication:** Email/Password
- **Hosting:** Compatible con GitHub Pages, Netlify, Vercel

---

¡Ahora tienes sincronización en la nube completamente funcional! 🎉
