#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# build-mac.sh
# Builds Meditor as a macOS .app bundle and packages it as a DMG.
#
# Usage:
#   ./build-mac.sh             # Uses version from package.json
#   VERSION=1.2.3 ./build-mac.sh  # Override version
# ─────────────────────────────────────────────────────────────

APP_NAME="Meditor"
BUNDLE_ID="com.meditor.app"
MIN_MACOS="10.13.0"
VERSION="${VERSION:-$(node -p "require('./package.json').version")}"

APP_DIR="build/${APP_NAME}.app"
DMG_PATH="build/${APP_NAME}-${VERSION}.dmg"

# ─── Clean ────────────────────────────────────────────────────
echo "==> Cleaning previous build artifacts"
rm -rf build
mkdir -p "${APP_DIR}/Contents/MacOS"
mkdir -p "${APP_DIR}/Contents/Resources"

# ─── Vite + Neutralino Build ──────────────────────────────────
echo "==> Building Vite frontend"
npm run build

echo "==> Bundling Neutralino application"
npx @neutralinojs/neu build

# ─── Verify binaries exist ────────────────────────────────────
if [ ! -f "dist/meditor/meditor-mac_universal" ]; then
  echo "ERROR: Universal binary not found at dist/meditor/meditor-mac_universal"
  echo "  Available binaries:"
  ls dist/meditor/ | grep meditor-mac || echo "  (none found)"
  exit 1
fi

if [ ! -f "dist/meditor/resources.neu" ]; then
  echo "ERROR: resources.neu not found at dist/meditor/resources.neu"
  exit 1
fi

# ─── Copy Binaries ────────────────────────────────────────────
echo "==> Copying binaries and resources"
cp "dist/meditor/meditor-mac_universal" "${APP_DIR}/Contents/MacOS/${APP_NAME}"
chmod +x "${APP_DIR}/Contents/MacOS/${APP_NAME}"
cp "dist/meditor/resources.neu" "${APP_DIR}/Contents/MacOS/"

# ─── App Icon (ICNS) ──────────────────────────────────────────
echo "==> Generating app icon (ICNS)"
ICONSET="build/icon.iconset"
mkdir -p "${ICONSET}"

sips -z 16   16   public/app-icon.png --out "${ICONSET}/icon_16x16.png"     > /dev/null
sips -z 32   32   public/app-icon.png --out "${ICONSET}/icon_16x16@2x.png"  > /dev/null
sips -z 32   32   public/app-icon.png --out "${ICONSET}/icon_32x32.png"     > /dev/null
sips -z 64   64   public/app-icon.png --out "${ICONSET}/icon_32x32@2x.png"  > /dev/null
sips -z 128  128  public/app-icon.png --out "${ICONSET}/icon_128x128.png"   > /dev/null
sips -z 256  256  public/app-icon.png --out "${ICONSET}/icon_128x128@2x.png"> /dev/null
sips -z 256  256  public/app-icon.png --out "${ICONSET}/icon_256x256.png"   > /dev/null
sips -z 512  512  public/app-icon.png --out "${ICONSET}/icon_256x256@2x.png"> /dev/null
sips -z 512  512  public/app-icon.png --out "${ICONSET}/icon_512x512.png"   > /dev/null
sips -z 1024 1024 public/app-icon.png --out "${ICONSET}/icon_512x512@2x.png"> /dev/null

iconutil -c icns "${ICONSET}" -o "${APP_DIR}/Contents/Resources/AppIcon.icns"
rm -rf "${ICONSET}"

# ─── Info.plist ───────────────────────────────────────────────
echo "==> Writing Info.plist (version: ${VERSION})"
cat > "${APP_DIR}/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleDisplayName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleExecutable</key>
    <string>${APP_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>${BUNDLE_ID}</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon.icns</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleVersion</key>
    <string>${VERSION}</string>
    <key>CFBundleShortVersionString</key>
    <string>${VERSION}</string>
    <key>LSMinimumSystemVersion</key>
    <string>${MIN_MACOS}</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSHumanReadableCopyright</key>
    <string>Copyright © 2026 Meditor. All rights reserved.</string>
</dict>
</plist>
PLIST

# ─── Package into DMG ─────────────────────────────────────────
echo "==> Packaging DMG: ${DMG_PATH}"
hdiutil create \
  -volname "${APP_NAME}" \
  -srcfolder "${APP_DIR}" \
  -ov \
  -format UDZO \
  "${DMG_PATH}"

echo ""
echo "✅ Build complete!"
echo "   App bundle : ${APP_DIR}"
echo "   DMG        : ${DMG_PATH}"
echo "   Version    : ${VERSION}"
