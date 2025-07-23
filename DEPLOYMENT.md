# Chrome Extension Deployment Guide

## Pre-Deployment Checklist

### 1. Code Review & Testing
- [ ] Test extension on both YouTube and YouTube Music
- [ ] Verify all features work as expected
- [ ] Test with different video types and scenarios
- [ ] Check console for any errors or warnings
- [ ] Verify permissions are working correctly

### 2. Manifest & Configuration
- [ ] Update version number in `manifest.json`
- [ ] Verify all permissions are necessary and documented
- [ ] Check that icons are properly referenced
- [ ] Ensure content security policy is appropriate
- [ ] Review host permissions scope

### 3. Environment & Security
- [ ] Ensure no `.env` files are included in final package
- [ ] Verify API keys are properly embedded during build
- [ ] Remove any debugging code or console.logs
- [ ] Check that no sensitive data is exposed

## Build for Production

### Step 1: Clean Previous Builds
```bash
npm run clean
```

### Step 2: Build for Production
```bash
npm run build:prod
```
This will:
- Minify JavaScript and CSS
- Remove source maps
- Optimize for production
- Works cross-platform (Windows, Mac, Linux)

### Step 3: Package Extension
```bash
npm run package
```
This will create `extension.zip` ready for submission.

## Manual Verification

After building, manually test the extension:

1. **Load Unpacked Extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked" and select your project folder
   - Test all functionality

2. **Test the Packaged Version**:
   - Extract `extension.zip` to a temporary folder
   - Load the extracted folder as unpacked extension
   - Verify everything works the same

## Chrome Web Store Submission

### Required Materials
- [ ] Extension ZIP file
- [ ] Store listing images (128x128, 440x280, 1400x560, 640x400)
- [ ] Description and keywords
- [ ] Privacy policy (if handling user data)
- [ ] Developer account verification

### Store Listing Requirements
- **Name**: MusicNerd Chrome Extension
- **Category**: Entertainment or Music & Audio
- **Description**: Clear explanation of functionality
- **Screenshots**: Show the extension in action
- **Icons**: High-quality promotional images

## Version Management

Update these files when releasing:
1. `manifest.json` - version field
2. `package.json` - version field
3. Create git tag: `git tag v1.0.0`

## Post-Deployment

1. **Monitor Reviews**: Check Chrome Web Store reviews
2. **Analytics**: Track usage if implemented
3. **Updates**: Plan for bug fixes and feature updates
4. **Backup**: Keep deployment packages for rollback

## Troubleshooting

### Common Issues
- **Permissions denied**: Check manifest permissions
- **CSP violations**: Review content security policy
- **API failures**: Verify API keys are properly embedded
- **Content script not loading**: Check match patterns in manifest

### Debug Steps
1. Check browser console for errors
2. Review extension's background page console
3. Verify network requests in DevTools
4. Test in incognito mode for clean state 