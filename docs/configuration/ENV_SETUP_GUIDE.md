# Environment Variables Setup Guide

This guide will help you configure the required environment variables for the MeowMeow PetShop application.

## Creating Your .env File

Create a `.env` file in the root directory of your project with the following configuration:

```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/meowmeowpetshop
# Or use MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/meowmeowpetshop

# Supabase Configuration (for OTP authentication)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Email Service Configuration (for password reset and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5000

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Secret (generate a random string)
SESSION_SECRET=your-secret-key-here
```

## Email Configuration Instructions

### Option 1: Gmail Setup (Recommended for Testing)

1. **Enable 2-Step Verification:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to Security > 2-Step Verification
   - Follow the steps to enable it

2. **Generate an App Password:**
   - In Security settings, find "App passwords"
   - Select "Mail" as the app
   - Select "Other" as the device and name it "MeowMeow PetShop"
   - Click "Generate"
   - Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

3. **Update your .env file:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Your generated app password
   ```

### Option 2: Other Email Providers

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=youremail@outlook.com
EMAIL_PASSWORD=your-password
```

**Yahoo Mail:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=youremail@yahoo.com
EMAIL_PASSWORD=your-app-password  # Generate app password in Yahoo settings
```

## Testing Your Configuration

After setting up your .env file:

1. Restart your server
2. Try the password change feature from the dashboard
3. Check server logs for any error messages
4. If emails aren't sending, verify:
   - Your email credentials are correct
   - The app password is properly generated
   - Your email provider allows SMTP access
   - Firewall/antivirus isn't blocking port 587

## Troubleshooting

### "Failed to send verification email" error

This error occurs when:
- Email credentials are not configured in the .env file
- Email credentials are incorrect
- SMTP server is unreachable
- App password hasn't been generated (for Gmail)

**Solution:**
1. Check that your .env file exists and contains all required EMAIL_* variables
2. Verify your email credentials
3. For Gmail, ensure you're using an App Password, not your regular password
4. Check server console logs for detailed error messages

### Email credentials not found

If you see "Email service not configured" in server logs:
1. Ensure your .env file is in the project root directory
2. Restart the development server after creating/updating .env
3. Verify the EMAIL_USER and EMAIL_PASSWORD values are set

## Security Notes

⚠️ **Important:**
- Never commit your .env file to version control
- The .env file is already listed in .gitignore
- Use app-specific passwords instead of your main email password
- Rotate your credentials periodically
- Use environment variables in production (not .env files)

## Need More Help?

- Check [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md) for detailed email configuration
- See [MONGODB_SETUP.md](MONGODB_SETUP.md) for database setup
- Review server console logs for specific error messages









