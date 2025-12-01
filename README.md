# SportScoreBiH

A comprehensive web platform for managing and following the Bosnian Premier League (Wwin Premijer Liga BiH), providing news, club information, player profiles, and live updates.

## 📋 Overview

SportScoreBiH is a full-stack application built with Angular (Frontend) and ASP.NET Core (Backend) that serves as a central hub for Bosnian football enthusiasts. The platform enables users to access news, view club details, explore player statistics, and interact with AI-powered assistance for league history and rules.

## 🚀 Features

### User Features
- **News & Articles**: Browse and read the latest football news with pagination and search functionality
- **Club Information**: Detailed club profiles including stadium information, contact details, and social media links
- **Player Profiles**: Comprehensive player database with photos, positions, and club affiliations
- **Interactive Maps**: Stadium locations displayed using Google Maps integration
- **AI Assistant**: Ask questions about Bosnian league history and football rules
- **User Authentication**: Secure registration and login with email verification
- **Profile Management**: Update user information and manage account settings
- **Comments & Reactions**: Engage with news articles through comments and like/dislike reactions
- **Social Sharing**: Share articles via WhatsApp and other platforms
- **QR Code Generation**: Generate QR codes for easy article sharing

### Admin Features
- **News Management**: Create, update, and delete news articles with multiple images
- **Player Management**: Add, edit, and remove player profiles
- **Comment Moderation**: View and manage user comments
- **Drag-and-Drop Upload**: Easy image uploading with preview functionality

## 🛠️ Technology Stack

### Frontend
- **Framework**: Angular 18.2.10
- **UI Components**: Angular Material
- **Styling**: SCSS/CSS
- **Animations**: Angular Animations
- **Image Handling**: NgxImageZoom
- **QR Code**: ngx-qrcode
- **Social Login**: @abacritt/angularx-social-login (Google)
- **CAPTCHA**: ngx-captcha

### Backend
- **Framework**: ASP.NET Core (C#)
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT Bearer tokens with refresh token mechanism
- **Storage**: Azure Blob Storage for images
- **Email Service**: Custom email service for verification and password reset
- **SMS Service**: Twilio integration
- **AI Integration**: External AI API for question-answering
- **Monitoring**: Sentry for error tracking

### Infrastructure
- **Maps**: Google Maps API
- **Cloud Storage**: Azure Blob Storage
- **Authentication**: Google OAuth 2.0
- **Error Tracking**: Sentry

## 🔐 Authentication & Authorization

### User Roles
- **Guest**: Can view news and club information
- **User**: Can comment, react, and manage profile
- **Admin**: Full access to content management

### Security Features
- JWT-based authentication with access and refresh tokens
- Password hashing for secure storage
- Email verification for new accounts
- Password reset functionality with token expiration
- Role-based route guards
- HTTP interceptors for automatic token attachment

## 👥 User Roles & Permissions

### Guest
- View news articles
- View club information
- Access public content

### Registered User
- All guest permissions
- Comment on articles
- React to comments
- Manage profile
- Access AI assistant

### Admin
- All user permissions
- Create/edit/delete news
- Manage players
- Moderate comments
- Access admin dashboard

## 📝 License
This project is part of a portfolio and is available for educational purposes.

## 👨‍💻 Author
**Nihad Mandzo and Adem Drpic**
