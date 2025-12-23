# Development Login Guide

This guide helps you access different dashboards during development **without needing API integration**.

## 🚀 Quick Access

You now have two ways to access the development login:

### Option 1: Development Login Page
Navigate directly to: **`http://localhost:3000/dev-login`**

### Option 2: Floating Button
Look for the **yellow "Dev Login" button** at the bottom-right corner of any page.

## 👥 Available Roles

### 1. 🏥 Hospital Admin
- **Dashboard**: Hospital overview with appointment statistics
- **Features**: 
  - View total, pending, and accepted appointments
  - Manage hospital profile
  - Access hospital settings
- **Navigation**: Home, Appointments, Settings

### 2. 👨‍⚕️ Doctor
- **Dashboard**: Doctor's appointment management
- **Features**:
  - View appointments and requests
  - Manage patients
  - Conduct consultations
- **Navigation**: Home, Appointments, Patients, Settings

### 3. 👤 Patient
- **Dashboard**: Patient's health management
- **Features**:
  - Find doctors
  - Book appointments
  - View medical records
- **Navigation**: Home, Find Doctors, Records, Appointments, Settings

### 4. 🔐 Admin
- **Dashboard**: System administration
- **Features**:
  - Manage users (Doctors, Patients, Admins)
  - View organization requests
  - System analytics
- **Navigation**: Overview, Appointments, User Management, Settings

## 📝 Mock Data Details

All mock users are pre-configured with:

- **Hospital**: Dev Ridge Hospital (Osu, Accra, Ghana)
- **Verified status**: All users are verified and active
- **Complete profiles**: All required fields are filled
- **No API needed**: All data is stored in Redux state

## 🎯 How to Use

1. **Start your development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Access the dev login**:
   - Click the yellow "Dev Login" button (bottom-right)
   - Or navigate to `/dev-login`

3. **Select a role**:
   - Click any of the role buttons (Hospital, Doctor, Patient, Admin)

4. **You're logged in!**:
   - You'll be redirected to `/dashboard`
   - The appropriate dashboard will load based on the role
   - Navigate using the sidebar

## 🛠️ For Hospital Dashboard Specifically

To access the **Hospital Dashboard**:

1. Go to `/dev-login`
2. Click **"Login as Hospital"**
3. You'll see:
   - Hospital greeting
   - Appointment statistics (Total, Pending, Accepted)
   - Hospital information overview
   - Navigation menu with: Home, Appointments, Settings

## 🔄 Switching Roles

To switch between roles during development:
1. Click the "Dev Login" button again
2. Select a different role
3. You'll be switched immediately

## ⚠️ Important Notes

### Before Production
**Remember to remove these development files:**

1. Delete `/src/app/dev-login/page.tsx`
2. Delete `/src/components/dev/DevLoginBanner.tsx`
3. Remove the `<DevLoginBanner />` import and component from `/src/app/layout.tsx`

### Why This Approach?

- ✅ **No API needed**: Work on UI without backend
- ✅ **Fast switching**: Test different roles instantly
- ✅ **Complete state**: All user data pre-populated
- ✅ **Real navigation**: Full dashboard experience
- ✅ **Easy cleanup**: Just delete 3 files before production

## 🐛 Troubleshooting

**Dashboard not loading?**
- Refresh the page
- Try clicking the role button again
- Check browser console for errors

**Need different mock data?**
- Edit `/src/app/dev-login/page.tsx`
- Modify the `mockUser` and `mockExtra` objects in the `loginAs()` function

**Want to test specific scenarios?**
- Add more role variations in the dev login page
- Create custom mock data for your use case

## 📚 Next Steps

Once you've tested the Hospital Dashboard:

1. Build your hospital-specific features
2. Add appointment management
3. Customize the hospital settings
4. When ready for API integration, remove the dev login files

---

**Happy Development! 🎉**

For questions or issues, check the main README or contact the team.
