# Ajokunto.fi Deployment Guide

## Overview

This guide covers deploying the Ajokunto.fi MVP to production using Vercel and Supabase.

## Prerequisites

- Node.js 18+ installed locally
- Supabase account
- Vercel account
- GitHub repository

## 1. Supabase Setup

### Create a new Supabase project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready

### Configure the database

1. In Supabase Dashboard, go to SQL Editor
2. Run the schema creation script from `supabase-schema.sql`
3. Run the functions script from `supabase-functions.sql`

### Set up Storage

1. Go to Storage in Supabase Dashboard
2. Create a new bucket called `car-media`
3. Set the bucket to be public or configure RLS policies as needed

### Configure Authentication

1. Go to Authentication > Settings
2. Configure email settings
3. Set up allowed redirect URLs for your domain

## 2. Environment Variables

Create a `.env.local` file based on `.env.local.example`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=https://your-domain.com
```

### Getting Supabase Keys

1. In Supabase Dashboard, go to Settings > API
2. Copy the Project URL for `NEXT_PUBLIC_SUPABASE_URL`
3. Copy the anon public key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy the service_role secret key for `SUPABASE_SERVICE_ROLE_KEY`

## 3. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at http://localhost:3000

## 4. Vercel Deployment

### Connect to GitHub

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository

### Configure Environment Variables

1. In Vercel Dashboard, go to your project settings
2. Add all environment variables from your `.env.local`
3. Make sure to update `NEXTAUTH_URL` to your production domain

### Deploy

1. Vercel will automatically deploy your main branch
2. Each push to main will trigger a new deployment

## 5. Domain Configuration

### Custom Domain (Optional)

1. In Vercel Dashboard, go to Settings > Domains
2. Add your custom domain
3. Configure DNS settings as instructed

### SSL Certificate

Vercel automatically provides SSL certificates for all domains.

## 6. Post-Deployment Setup

### Configure Supabase Auth Redirects

1. In Supabase Dashboard, go to Authentication > Settings
2. Add your production URLs to "Site URL" and "Redirect URLs":
   - `https://your-domain.com`
   - `https://your-domain.com/auth/callback`

### Test Core Functionality

1. User registration and login
2. Car creation
3. Checklist editing
4. PDF export
5. Permissions management
6. Media upload

## 7. Monitoring and Maintenance

### Error Monitoring

Consider setting up error monitoring with:
- Sentry
- LogRocket
- Vercel Analytics

### Database Monitoring

Monitor Supabase:
- Database performance
- Storage usage
- Authentication metrics

### Backup Strategy

- Supabase automatically backs up your database
- Consider setting up additional backup routines for critical data

## 8. Scaling Considerations

### Database

- Monitor database performance
- Consider upgrading Supabase plan as usage grows
- Implement database indexing optimizations

### Storage

- Monitor storage usage for media files
- Consider CDN for media delivery
- Implement file size limits and compression

### Performance

- Enable Vercel Analytics
- Monitor Core Web Vitals
- Consider implementing caching strategies

## 9. Security Checklist

- [ ] All environment variables are secure
- [ ] Supabase RLS policies are properly configured
- [ ] File upload size limits are in place
- [ ] Authentication flows are tested
- [ ] HTTPS is enforced
- [ ] CSP headers are configured (if needed)

## 10. Common Issues

### Authentication Issues

- Check Supabase auth configuration
- Verify redirect URLs
- Check environment variables

### Database Connection Issues

- Verify Supabase connection strings
- Check database schema is properly created
- Verify RLS policies

### File Upload Issues

- Check Supabase storage bucket configuration
- Verify file size limits
- Check storage policies

## Support

For issues with:
- **Supabase**: Check [Supabase documentation](https://supabase.com/docs)
- **Vercel**: Check [Vercel documentation](https://vercel.com/docs)
- **Next.js**: Check [Next.js documentation](https://nextjs.org/docs)

## Next Steps

After successful deployment, consider:

1. Setting up CI/CD pipeline
2. Implementing automated testing
3. Adding monitoring and alerting
4. Creating staging environment
5. Implementing feature flags
6. Adding comprehensive logging