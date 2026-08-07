#!/bin/bash
set -e

echo "==> Building Neutralino App"
npm run build
npx @neutralinojs/neu build

echo "==> Preparing macOS .app bundle"
APP_NAME="Meditor"
APP_DIR="build/${APP_NAME}.app"

# Clean previous build
rm -rf "build"
mkdir -p "build"

# Create standard macOS App Bundle structure
mkdir -p "${APP_DIR}/Contents/MacOS"
mkdir -p "${APP_DIR}/Contents/Resources"

# Generate ICNS file from app-icon
echo "==> Generating App Icon (ICNS)"
mkdir -p build/icon.iconset
sips -z 16 16     public/app-icon.png --out build/icon.iconset/icon_16x16.png > /dev/null
sips -z 32 32     public/app-icon.png --out build/icon.iconset/icon_16x16@2x.png > /dev/null
sips -z 32 32     public/app-icon.png --out build/icon.iconset/icon_32x32.png > /dev/null
sips -z 64 64     public/app-icon.png --out build/icon.iconset/icon_32x32@2x.png > /dev/null
sips -z 128 128   public/app-icon.png --out build/icon.iconset/icon_128x128.png > /dev/null
sips -z 256 256   public/app-icon.png --out build/icon.iconset/icon_128x128@2x.png > /dev/null
sips -z 256 256   public/app-icon.png --out build/icon.iconset/icon_256x256.png > /dev/null
sips -z 512 512   public/app-icon.png --out build/icon.iconset/icon_256x256@2x.png > /dev/null
sips -z 512 512   public/app-icon.png --out build/icon.iconset/icon_512x512.png > /dev/null
sips -z 1024 1024 public/app-icon.png --out build/icon.iconset/icon_512x512@2x.png > /dev/null
iconutil -c icns build/icon.iconset -o "${APP_DIR}/Contents/Resources/icon.icns"
rm -rf build/icon.iconset

echo "==> Copying binaries and resources"
# Using mac_universal to support both Intel and Apple Silicon
cp dist/meditor/meditor-mac_universal "${APP_DIR}/Contents/MacOS/${APP_NAME}"
cp dist/meditor/resources.neu "${APP_DIR}/Contents/MacOS/"

echo "==> Generating Info.plist"
cat <<EOF > "${APP_DIR}/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>${APP_NAME}</string>
    <key>CFBundleIconFile</key>
    <string>icon.icns</string>
    <key>CFBundleIdentifier</key>
    <string>com.meditor.app</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

echo "==> Creating DMG"
DMG_NAME="Meditor.dmg"
hdiutil create -volname "${APP_NAME}" -srcfolder "${APP_DIR}" -ov -format UDZO "build/${DMG_NAME}"

echo "==> Done! DMG created at build/${DMG_NAME}"
