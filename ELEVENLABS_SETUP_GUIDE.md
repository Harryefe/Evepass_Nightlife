# 🎤 ElevenLabs API Setup Guide - UPDATED

## ✅ **Your New API Key is Configured!**

Your fresh ElevenLabs API key has been updated:
```
sk_c53c05c01141a4ec985fc7850cd2a06a3d4964e1e653a802
```

---

## 🚀 **Quick Test Instructions**

### **Step 1: Restart Your Development Server**
```bash
# Stop your current server (Ctrl+C if running)
npm run dev
```

### **Step 2: Test Eve AI Voice**
1. Go to your app: `http://localhost:3000`
2. **Sign in as a customer** (this is required!)
3. Navigate to **"AI Assistant"** page
4. Look for the **voice status indicator** in the header:
   - 🟢 **"Voice Ready"** = Working perfectly!
   - 🔴 **"Voice Unavailable"** = API key issue
   - 🔵 **"Testing Voice..."** = Still connecting

### **Step 3: Try Voice Features**
1. Make sure the **voice toggle is ON** (purple speaker icon)
2. Send a message like **"Hello Eve"**
3. You should hear Eve's voice response!

---

## 🔍 **Real-Time Status Monitoring**

Your AI Assistant now shows live connection status:

### **Connection Indicators:**
- ✅ **Green checkmark** = ElevenLabs connected and ready
- ❌ **Red X** = Connection failed or API key issue
- 🔄 **Spinning loader** = Testing connection
- ❓ **Gray question mark** = Status unknown

### **Voice Settings Panel:**
- Choose between different Eve personalities
- Real-time connection status
- Error messages if something goes wrong

---

## 🎯 **Test Commands to Try**

Once connected, test these messages:

1. **"Hello Eve"** - Simple greeting with voice
2. **"Find venues near me"** - Venue recommendations
3. **"Help me plan my night"** - Planning assistance
4. **"What safety features do you have?"** - DrunkSafe info
5. **"Tell me about bottle sharing"** - Social features

---

## 🔧 **Troubleshooting Your New Key**

### **If Voice Still Doesn't Work:**

**1. Check Browser Console (F12 → Console):**
- Look for any red error messages
- Common errors and solutions below

**2. Test Connection Button:**
- Click "Test Connection" in the AI Assistant header
- This will show you exactly what's wrong

**3. Check Your ElevenLabs Dashboard:**
- Go to https://elevenlabs.io
- Sign in and check your usage/quota

---

## 🚨 **Common Error Solutions**

### **Error: "ElevenLabs API key not configured"**
✅ **Solution**: Restart your dev server - the new key should work

### **Error: "Invalid API key"**
✅ **Solution**: Your key might be restricted. Check ElevenLabs dashboard permissions

### **Error: "Quota exceeded"**
✅ **Solution**: Check your monthly character usage in ElevenLabs dashboard

### **Error: "Network error"**
✅ **Solution**: Check your internet connection and try again

---

## 📊 **Your ElevenLabs Account Info**

### **Free Tier Includes:**
- ✅ **10,000 characters/month** (about 15-20 minutes of speech)
- ✅ **All voice models** including the latest
- ✅ **Commercial use** allowed
- ✅ **High-quality audio** (44.1kHz)

### **Character Usage Examples:**
- "Hello, how are you?" = ~18 characters
- Typical Eve AI response = ~100-300 characters
- You can get ~30-100 voice responses per month

---

## 🎉 **Success Checklist**

You'll know it's working when:
- [ ] ✅ Voice status shows "Voice Ready" (green checkmark)
- [ ] ✅ Eve responds with both text AND voice
- [ ] ✅ You can hear clear, natural speech
- [ ] ✅ No error messages in browser console
- [ ] ✅ Voice settings panel appears with personality options

---

## 🔐 **Security Best Practices**

- ✅ **Never share your API key** publicly or in screenshots
- ✅ **Don't commit `.env.local`** to version control
- ✅ **Monitor usage** regularly in ElevenLabs dashboard
- ✅ **Regenerate keys** if you suspect they're compromised

---

## 📞 **Still Need Help?**

If you're still having issues after restarting:

1. **Check the voice status indicator** in AI Assistant header
2. **Click "Test Connection"** to see detailed error info
3. **Check browser console** (F12) for error messages
4. **Verify your ElevenLabs account** is active and has quota remaining

---

## 🎵 **Voice Personalities Available**

Your app includes 4 different Eve personalities:

1. **Eve Friendly** (Default) - Warm and conversational
2. **Eve Professional** - Clear and authoritative  
3. **Eve Energetic** - Upbeat and exciting
4. **Eve Calm** - Soothing and relaxed

Switch between them in the AI Assistant voice settings!

---

**Your new API key is ready to go! Just restart your dev server and test it out.** 🚀

**Expected Result:** You should hear Eve's voice when you send messages in the AI Assistant! 🎤✨