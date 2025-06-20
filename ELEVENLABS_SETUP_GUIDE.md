# 🎤 ElevenLabs API Setup Guide - Step by Step

## 📋 **What You Need:**
- An ElevenLabs account (free tier available)
- 5 minutes to set up
- Your API key (I'll show you exactly how to get it)

---

## 🚀 **Step 1: Create Your ElevenLabs Account**

### **1.1 Go to ElevenLabs Website**
- Open your browser and go to: **https://elevenlabs.io**
- Click the **"Sign Up"** button in the top right corner

### **1.2 Choose Your Signup Method**
- **Option A**: Sign up with Google (fastest)
- **Option B**: Sign up with email and create a password
- **Option C**: Sign up with GitHub

### **1.3 Verify Your Account**
- Check your email for a verification link
- Click the verification link to activate your account

---

## 🔑 **Step 2: Get Your API Key (CRITICAL STEP)**

### **2.1 Access Your Profile**
- Once logged in, look for your **profile picture** or **avatar** in the top right corner
- Click on it to open the dropdown menu

### **2.2 Navigate to API Settings**
- In the dropdown menu, click **"Profile"** or **"Settings"**
- Look for a tab or section called **"API Keys"** or **"Developer"**
- If you don't see it immediately, look for a **"API"** link in the left sidebar

### **2.3 Generate Your API Key**
- Click the **"Create API Key"** or **"Generate New Key"** button
- Give your key a name like "Evepass Nightlife App"
- **IMPORTANT**: Copy the key immediately - you won't be able to see it again!

### **2.4 Your API Key Format**
Your API key should look like this:
```
sk_1234567890abcdef1234567890abcdef1234567890abcdef
```
- It ALWAYS starts with `sk_`
- It's about 50+ characters long
- Contains letters and numbers

---

## 🔧 **Step 3: Configure Your API Key**

### **3.1 Add to Environment Variables**
I've already added your API key to the `.env.local` file:
```env
ELEVENLABS_API_KEY=sk_c40f269b802b8b90a063e0fcf0c02846a6a91677d0b05b50
```

### **3.2 Verify the Key Format**
✅ **Correct format**: `sk_c40f269b802b8b90a063e0fcf0c02846a6a91677d0b05b50`
❌ **Wrong format**: Missing `sk_` prefix or too short

---

## 🧪 **Step 4: Test Your Connection**

### **4.1 Restart Your Development Server**
```bash
# Stop your current server (Ctrl+C)
# Then restart it
npm run dev
```

### **4.2 Test Eve AI Voice**
1. Go to your app: `http://localhost:3000`
2. Sign in as a customer
3. Navigate to **"AI Assistant"** page
4. Make sure the **voice toggle** is ON (speaker icon should be purple)
5. Send a message like "Hello Eve"
6. You should hear Eve's voice response!

---

## 🔍 **Step 5: Troubleshooting**

### **5.1 If Voice Doesn't Work**

**Check Browser Console:**
1. Press `F12` to open developer tools
2. Go to the **"Console"** tab
3. Look for any red error messages
4. Common errors and solutions:

**Error: "ElevenLabs API key not configured"**
- ✅ **Solution**: Make sure your API key is in `.env.local` and starts with `sk_`

**Error: "Invalid API key"**
- ✅ **Solution**: Double-check you copied the full API key from ElevenLabs
- ✅ **Solution**: Generate a new API key if needed

**Error: "Quota exceeded"**
- ✅ **Solution**: You've used your free monthly characters. Check your ElevenLabs dashboard

### **5.2 Check Your ElevenLabs Dashboard**

**Monitor Usage:**
1. Go to https://elevenlabs.io
2. Sign in to your account
3. Look for **"Usage"** or **"Billing"** in the sidebar
4. Check your character usage vs. limit

**Free Tier Limits:**
- **10,000 characters per month** (about 15-20 minutes of speech)
- **3 custom voices**
- **High-quality audio**

---

## 📊 **Step 6: Understanding Your Limits**

### **6.1 Free Tier (Perfect for Testing)**
- ✅ 10,000 characters/month
- ✅ All voice models
- ✅ Commercial use allowed
- ✅ High-quality audio

### **6.2 Character Usage Examples**
- "Hello, how are you?" = ~18 characters
- A typical Eve AI response = ~100-300 characters
- You can get ~30-100 voice responses per month on free tier

### **6.3 Upgrade Options (If Needed Later)**
- **Starter**: $5/month - 30,000 characters
- **Creator**: $22/month - 100,000 characters
- **Pro**: $99/month - 500,000 characters

---

## ✅ **Step 7: Verification Checklist**

Before testing, make sure:

- [ ] ✅ ElevenLabs account created and verified
- [ ] ✅ API key generated and copied
- [ ] ✅ API key added to `.env.local` file
- [ ] ✅ API key starts with `sk_`
- [ ] ✅ Development server restarted
- [ ] ✅ Signed in as a customer in the app
- [ ] ✅ Voice toggle is enabled (purple speaker icon)

---

## 🎯 **Step 8: Test Commands**

Try these messages to test Eve AI voice:

1. **"Hello Eve"** - Simple greeting
2. **"Find venues near me"** - Venue recommendation
3. **"Help me plan my night"** - Planning assistance
4. **"What safety features do you have?"** - DrunkSafe info

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Unable to connect to ElevenLabs"**
**Solutions:**
1. Check your internet connection
2. Verify API key is correct
3. Check ElevenLabs service status: https://status.elevenlabs.io

### **Issue 2: "Voice not playing"**
**Solutions:**
1. Check browser audio permissions
2. Make sure volume is up
3. Try a different browser
4. Check if audio is blocked by browser

### **Issue 3: "Quota exceeded"**
**Solutions:**
1. Check your ElevenLabs dashboard usage
2. Wait for monthly reset
3. Consider upgrading your plan

### **Issue 4: "API key invalid"**
**Solutions:**
1. Regenerate a new API key
2. Make sure you copied the entire key
3. Check for extra spaces in `.env.local`

---

## 🎉 **Success Indicators**

You'll know it's working when:
- ✅ Eve AI responds with text AND voice
- ✅ You hear clear, natural speech
- ✅ No error messages in browser console
- ✅ Voice settings panel appears in AI Assistant

---

## 📞 **Need Help?**

If you're still having issues:

1. **Check the browser console** (F12 → Console tab)
2. **Copy any error messages** you see
3. **Check your ElevenLabs dashboard** for usage/errors
4. **Try generating a new API key** if the current one doesn't work

---

## 🔐 **Security Notes**

- ✅ **Never share your API key publicly**
- ✅ **Don't commit `.env.local` to version control**
- ✅ **Regenerate keys if compromised**
- ✅ **Monitor usage regularly**

---

**Your API key is already configured! Just restart your dev server and test the AI Assistant page.** 🚀
