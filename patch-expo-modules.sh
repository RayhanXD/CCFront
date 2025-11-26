#!/bin/bash

# Patch CSSProps.kt - Fix BoxShadow.parse() call
sed -i '' 's/BoxShadow.parse(boxShadow, context)/BoxShadow.parse(boxShadow)/g' \
  node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/views/decorators/CSSProps.kt

# Patch ReactNativeFeatureFlags.kt - Remove enableBridgelessArchitecture reference
sed -i '' 's/ReactNativeFeatureFlags.enableBridgelessArchitecture()/false/g' \
  node_modules/expo-modules-core/android/src/main/java/expo/modules/rncompatibility/ReactNativeFeatureFlags.kt

echo "Patches applied successfully!"
