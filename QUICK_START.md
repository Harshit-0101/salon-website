# 🚀 QUICK START GUIDE

## Get Started in 2 Minutes!

### Step 1: Open the Website
1. Find the folder where you downloaded the files
2. Double-click on `index.html`
3. Your website opens in your browser ✅

### Step 2: Customize Key Information (REQUIRED)

**Update your WhatsApp number:**
- Find all instances of `+919876543210` in `index.html`
- Replace with your WhatsApp number (format: +[country code][number])
- Lines: 45, 213, 239, 468, 489

**Update your phone number:**
- Replace `+919876543210` with your phone
- Lines: 208, 209, 223

**Update your address:**
- Find: "123 Fashion Street, New Delhi, India 110001"
- Replace with your business address
- Line: 207

**Update your email:**
- Find: "info@premiumsalon.com"
- Replace with your email
- Line: 226

### Step 3: Basic Customization

**Change Business Name:**
```
HTML - Line 38: Change "Premium Salon" to your business name
HTML - Line 4: Update <title> tag
HTML - Line 495: Update footer text
```

**Change Hero Section Text:**
```
Line 68: <h1> - Your main headline
Line 69: <p> - Your subheadline
Line 76: Update image URL
```

**Update Limited Offer Banner:**
```
Line 28: <p> - Update your offer text
```

**Change Primary Color:**
```
CSS - Line 9: Edit --primary-color (currently #1a3a52)
CSS - Line 10: Edit --secondary-color (currently #d4af37)
```

### Step 4: Update Services

Find the Services section (line 195) and update each service card:

```html
<h3>Your Service Name</h3>
<p>Your service description here</p>
<div class="service-price">Your price here</div>
```

### Step 5: Add Your Images

Replace image URLs in these sections:
- **Hero Section** (Line 76): Main banner image
- **About Section** (Line 302): Your business photo
- **Gallery Section** (Lines 343-363): Your work photos

**Find free images at:**
- https://unsplash.com
- https://pexels.com
- https://pixabay.com

### Step 6: Update Testimonials

Find testimonials section (line 377) and add your customer reviews:

```html
<p>"Great service! Highly recommended!"</p>
<h4>Customer Name</h4>
<p>Regular Customer</p>
```

### Step 7: Update Gallery

Replace 6 gallery images with your own:
- Product photos
- Your work
- Satisfied customers
- Your business space

### Step 8: Customize About Section

Update the "Why Choose Us" section (line 300):
- Change business story
- Update years of experience
- Modify the features list

### Step 9: Update Trust Badges

Customize these numbers to match your business (line 94-107):
- Rating (currently 4.9/5)
- Number of clients (currently 1000+)
- Years in business (currently 10)
- Certification status

---

## 🎯 PRIORITY CUSTOMIZATION ORDER

1. ⚠️ **MUST DO:**
   - [ ] Update WhatsApp number
   - [ ] Update phone number
   - [ ] Update address
   - [ ] Update business name

2. 🔥 **HIGHLY RECOMMENDED:**
   - [ ] Change hero section image
   - [ ] Update hero text
   - [ ] Change primary color to match your brand
   - [ ] Update services
   - [ ] Add your testimonials

3. ✨ **NICE TO HAVE:**
   - [ ] Add gallery images
   - [ ] Update about section
   - [ ] Customize trust badges
   - [ ] Update limited offer banner

---

## 🔧 HOW TO EDIT FILES

### Using Notepad (Windows)
1. Right-click on the HTML/CSS/JS file
2. Select "Open with" → Notepad
3. Edit the text
4. Save (Ctrl+S)
5. Refresh browser (F5)

### Using Visual Studio Code (Recommended)
1. Download: https://code.visualstudio.com
2. Open VS Code
3. Drag and drop your folder into VS Code
4. Edit files
5. Save and refresh browser

### Using Online Editor
1. Visit: https://www.w3schools.com/tryit
2. Copy code from files
3. Paste and edit
4. Test changes

---

## 🌐 DEPLOY TO INTERNET (5 Minutes)

### Option 1: Netlify (Easiest)
1. Go to https://app.netlify.com
2. Sign up (free)
3. Drag and drop your folder
4. Wait for deployment
5. Get a live URL!

### Option 2: Vercel
1. Go to https://vercel.com
2. Click "Deploy"
3. Import your folder
4. Deploy
5. Get your live URL

---

## 📋 ESSENTIAL NUMBERS TO UPDATE

1. **WhatsApp:** +919876543210 → Your WhatsApp number
2. **Phone:** +919876543210 → Your phone
3. **Address:** 123 Fashion Street → Your address
4. **Email:** info@premiumsalon.com → Your email
5. **Hours:** Update opening hours
6. **Prices:** Update service prices

---

## ✅ TESTING CHECKLIST

Before going live, test:
- [ ] All links work
- [ ] WhatsApp button works
- [ ] Phone numbers are clickable
- [ ] Contact form works
- [ ] Website looks good on mobile
- [ ] Images load properly
- [ ] No broken links

---

## 🎨 CHANGING COLORS

Open `style.css` and find lines 8-16:

```css
:root {
    --primary-color: #1a3a52;      /* Main color - change this */
    --secondary-color: #d4af37;    /* Accent color - change this */
    --accent-color: #0096d6;       /* Light color - change this */
}
```

**Suggested Color Schemes:**

**Professional Blue & Gold** (Current)
```
Primary: #1a3a52 (Dark Blue)
Secondary: #d4af37 (Gold)
```

**Modern Green & White**
```
Primary: #2d6a4f (Green)
Secondary: #f0f0f0 (Light)
```

**Red Restaurant**
```
Primary: #c41e3a (Red)
Secondary: #fff (White)
```

**Purple Luxury**
```
Primary: #5b2d73 (Purple)
Secondary: #e6b3d5 (Pink)
```

Use color picker: https://color-hex.com

---

## 💡 COMMON EDITS

### Change "Premium Salon" to Your Business
Search and replace (Ctrl+H in most editors):
- Find: `Premium Salon`
- Replace: `Your Business Name`

### Change All Prices
Find the service cards and edit prices like:
```
<div class="service-price">From ₹500</div>
```

### Add More Services
Copy one service card block and paste it multiple times, then edit each one.

### Change Currency
Replace ₹ symbol:
- ₹ (Indian Rupee)
- $ (Dollar)
- € (Euro)
- £ (Pound)

---

## 🚨 IMPORTANT REMINDERS

1. **Phone Numbers:**
   - Must include country code
   - Format: +[country][area][number]
   - Example: +919876543210

2. **Images:**
   - Use high-quality images
   - At least 600x600px for hero
   - Optimize image size (< 2MB per image)

3. **WhatsApp:**
   - Use business account if available
   - Test links before going live
   - Update predefined messages if needed

4. **Mobile Testing:**
   - Always test on phone before deploying
   - Check button sizes (should be tap-friendly)
   - Verify form works on mobile

---

## 📞 NEED HELP?

### Links Not Working
- Check for typos in URLs
- Ensure country code is included
- Test in different browser

### Images Not Showing
- Check image URL is correct
- Ensure website is accessible
- Try different image URL

### Form Issues
- Check browser console (F12)
- Verify all fields have values
- Ensure WhatsApp number is correct

### Performance Issues
- Compress images
- Clear browser cache
- Use Chrome DevTools to check

---

## 🎉 YOU'RE READY!

Your professional website is ready to go live!

**Next Steps:**
1. Customize it with your information
2. Test everything works
3. Deploy to internet (Netlify or Vercel)
4. Share your new website!

---

**Questions?** Check the full README.md for detailed instructions!
