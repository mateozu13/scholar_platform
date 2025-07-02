## Compilar App

Seguir los pasos en la terminal dentro del proyecto para compilar:
$ ionic capacitor build android
$ ionic capacitor sync android
$ cd android
$ .\gradlew clean assembleDebug (dentro de .\android)
$ adb install -r .\app\build\outputs\apk\debug\app-debug.apk (dentro de .\android)
