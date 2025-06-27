# Firebase Service Account Key Instructions

## 📋 **Service Account Key Update Required**

The Firebase project has been updated to use `edugenie-a` instead of `edugenie-h-ba04c`.

### 🔧 **Steps to Update Service Account Key:**

1. **Go to Firebase Console**: https://console.firebase.google.com/project/edugenie-a/settings/serviceaccounts/adminsdk

2. **Generate New Private Key**:

   - Click "Generate new private key"
   - Download the JSON file
   - Rename it to something like `edugenie-a-service-account.json`

3. **Place the File**:

   - Put the new JSON file in this `JSON/` folder
   - Update any scripts or services that reference the old file

4. **Update References**:
   - Check any Node.js scripts that might use this service account
   - Update file paths in configuration files

### 📁 **Current Status**:

- ✅ Old file renamed to `edugenie-h-ba04c-9bf32eb544c7.json.old`
- ⚠️ New service account key needed for `edugenie-a` project
- ✅ All environment variables updated in `.env.local`
- ✅ All hardcoded references updated in source code

### 🔒 **Security Note**:

- Keep service account keys secure
- Add `*.json` to `.gitignore` if not already present
- Never commit service account keys to version control

### 💡 **Alternative**:

If you don't need server-side Firebase Admin SDK features, you can continue using just the client-side SDK with the environment variables in `.env.local`.
