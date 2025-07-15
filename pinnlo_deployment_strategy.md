# Pinnlo Multi-Environment Deployment Strategy

## Overview

This document outlines the complete setup for Pinnlo's 4-environment development and deployment workflow:

1. **Local Dev** - Local machine connected to Dev Supabase DB
2. **Online Dev** - Vercel deployment connected to Dev Supabase DB
3. **Staging** - Vercel staging connected to Staging Supabase DB
4. **Production** - Vercel production connected to Production Supabase DB

## Environment Architecture

```
┌─────────────┬─────────────────┬──────────────────────┬─────────────────────┐
│ Environment │ Location        │ Database             │ Domain              │
├─────────────┼─────────────────┼──────────────────────┼─────────────────────┤
│ Local Dev   │ localhost:3000  │ Dev Supabase DB      │ localhost:3000      │
│ Online Dev  │ Vercel          │ Dev Supabase DB      │ pinnlo-dev.vercel   │
│ Staging     │ Vercel          │ Staging Supabase DB  │ pinnlo-staging.vercel│
│ Production  │ Vercel          │ Production Supabase  │ pinnlo.vercel.app   │
└─────────────┴─────────────────┴──────────────────────┴─────────────────────┘
```

## Database Setup

### Current Database (Development)
- **Project ID**: `dqqiqhagapiekdtcuoqr`
- **URL**: `https://dqqiqhagapiekdtcuoqr.supabase.co`
- **Use for**: Local Dev + Online Dev environments

### Required New Databases

#### Staging Database
1. Create new Supabase project: `pinnlo-staging`
2. Note project ID, URL, and keys
3. Apply all migrations from `/supabase/migrations/`

#### Production Database
1. Create new Supabase project: `pinnlo-production`
2. Note project ID, URL, and keys
3. Apply all migrations from `/supabase/migrations/`

## Environment Variables Configuration

### 1. Local Dev (.env.local) - Current Setup
```bash
NEXT_PUBLIC_SUPABASE_URL=https://dqqiqhagapiekdtcuoqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:27yyGsqVXFKfgoMY@dqqiqhagapiekdtcuoqr.supabase.co:5432/postgres

# Local development only
MCP_SERVER_URL=http://localhost:3001
MCP_SERVER_TOKEN=pinnlo-dev-token-2025
```

### 2. Online Dev Environment (Vercel)
```bash
# Same as local dev - shares development database
NEXT_PUBLIC_SUPABASE_URL=https://dqqiqhagapiekdtcuoqr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[same as local]
SUPABASE_SERVICE_ROLE_KEY=[same as local]
DATABASE_URL=[same as local]

# Skip MCP variables for deployed environments
```

### 3. Staging Environment (Vercel)
```bash
# New staging database credentials
NEXT_PUBLIC_SUPABASE_URL=https://[staging-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[staging anon key]
SUPABASE_SERVICE_ROLE_KEY=[staging service key]
DATABASE_URL=postgresql://postgres:[staging-password]@[staging-project-id].supabase.co:5432/postgres
```

### 4. Production Environment (Vercel)
```bash
# New production database credentials
NEXT_PUBLIC_SUPABASE_URL=https://[production-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[production anon key]
SUPABASE_SERVICE_ROLE_KEY=[production service key]
DATABASE_URL=postgresql://postgres:[production-password]@[production-project-id].supabase.co:5432/postgres
```

## Git Branch Strategy

### Branch Structure
```bash
main           # Production branch
├── staging    # Staging branch
└── development # Online dev branch
    └── feature/* # Feature branches
```

### Setting Up Branches
```bash
cd /Users/matthewfitzpatrick/pinnlo-v2

# Create and push branches
git checkout -b development
git push origin development

git checkout -b staging
git push origin staging

git checkout main
git push origin main
```

## Vercel Deployment Configuration

### Project 1: Development (pinnlo-dev)
- **GitHub Branch**: `development`
- **Domain**: `pinnlo-dev.vercel.app`
- **Environment Variables**: Development database credentials
- **Auto-deploy**: On push to `development` branch

### Project 2: Staging (pinnlo-staging)
- **GitHub Branch**: `staging`
- **Domain**: `pinnlo-staging.vercel.app`
- **Environment Variables**: Staging database credentials
- **Auto-deploy**: On push to `staging` branch

### Project 3: Production (pinnlo-production)
- **GitHub Branch**: `main`
- **Domain**: `pinnlo.vercel.app` (or custom domain)
- **Environment Variables**: Production database credentials
- **Auto-deploy**: On push to `main` branch

## Development Workflow

### Daily Development Process

```bash
# 1. Local Development
cd /Users/matthewfitzpatrick/pinnlo-v2
npm run dev
# Work on features locally, test against dev database

# 2. Push to Online Dev
git add .
git commit -m "Add new feature"
git push origin development
# → Auto-deploys to pinnlo-dev.vercel.app

# 3. Promote to Staging (when feature is complete)
git checkout staging
git merge development
git push origin staging
# → Auto-deploys to pinnlo-staging.vercel.app

# 4. Promote to Production (after staging approval)
git checkout main
git merge staging
git push origin main
# → Auto-deploys to pinnlo.vercel.app
```

### Feature Development Process

```bash
# Create feature branch
git checkout development
git checkout -b feature/new-intelligence-filters

# Develop and test locally
npm run dev

# Push feature branch for review
git push origin feature/new-intelligence-filters
# Create PR to development branch

# After PR approval, merge to development
git checkout development
git merge feature/new-intelligence-filters
git push origin development
```

## Database Migration Strategy

### Apply Migrations to New Databases

#### For Staging Database:
```bash
# Link to staging project
supabase link --project-ref [staging-project-id]

# Apply all migrations
supabase db push

# Verify schema
supabase db diff
```

#### For Production Database:
```bash
# Link to production project
supabase link --project-ref [production-project-id]

# Apply all migrations
supabase db push

# Verify schema
supabase db diff
```

### Current Migrations to Apply
Located in `/supabase/migrations/`:
- `001_core_tables.sql`
- `20250106_add_cards_table.sql`
- `20250107_refactor_intelligence_profiles_global.sql`
- `20250108_intelligence_cards_system.sql`
- `20250111_add_executive_summaries.sql`
- `20250111_intelligence_automation.sql`
- `20250710_intelligence_groups.sql`
- `20250710_strategy_creator_schema.sql`
- `20250711_add_system_prompt.sql`
- `20250711_dev_bank_simple.sql`
- `20250711_development_bank_tables.sql`
- `20250711_task_list_enhancements.sql`
- `20250711_technical_requirements_tables.sql`
- `20250711_trd_simple.sql`
- `20250712_tech_stack_cards_enhanced.sql`
- `20250713_create_development_groups.sql`
- `20250714_create_organisation_bank.sql`

## Implementation Timeline

### Week 1: Database Setup

#### Day 1: Staging Database
- [ ] Create new Supabase project for staging
- [ ] Note project credentials
- [ ] Apply all migrations to staging database
- [ ] Test database connection

#### Day 2: Production Database
- [ ] Create new Supabase project for production
- [ ] Note project credentials
- [ ] Apply all migrations to production database
- [ ] Test database connection

#### Day 3: Environment Configuration
- [ ] Create environment variable documentation
- [ ] Test local connection to each database
- [ ] Verify authentication settings in each Supabase project

### Week 2: Deployment Setup

#### Day 1: Git and Branch Setup
- [ ] Create development and staging branches
- [ ] Push all branches to GitHub
- [ ] Set up branch protection rules

#### Day 2: Vercel Projects
- [ ] Create pinnlo-dev Vercel project
- [ ] Create pinnlo-staging Vercel project
- [ ] Create pinnlo-production Vercel project
- [ ] Configure environment variables for each

#### Day 3: Testing and Documentation
- [ ] Test auto-deployment workflow
- [ ] Verify database connections in each environment
- [ ] Test authentication flow
- [ ] Document any issues and solutions

## Vercel CLI Commands

### Initial Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy development environment
git checkout development
vercel --prod
# Follow prompts to create pinnlo-dev project

# Deploy staging environment
git checkout staging
vercel --prod
# Follow prompts to create pinnlo-staging project

# Deploy production environment
git checkout main
vercel --prod
# Follow prompts to create pinnlo-production project
```

### Environment Variable Management
```bash
# Add environment variables to specific project
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add DATABASE_URL production

# List environment variables
vercel env ls

# Remove environment variable
vercel env rm VARIABLE_NAME production
```

## Testing Strategy

### Environment Testing Checklist

#### Local Development
- [ ] Application starts without errors
- [ ] Database connections work
- [ ] Authentication flow works
- [ ] All features function correctly

#### Online Development
- [ ] Deployment successful
- [ ] Environment variables loaded correctly
- [ ] Database operations work
- [ ] Authentication redirects work with domain

#### Staging
- [ ] Clean database with test data
- [ ] All features work with staging data
- [ ] Performance testing completed
- [ ] Security testing completed

#### Production
- [ ] Migration from staging successful
- [ ] Real data operations work correctly
- [ ] Monitoring and logging active
- [ ] Backup procedures tested

## Security Considerations

### Database Security
- **Development**: Open for testing, can be reset
- **Staging**: Restricted access, test data only
- **Production**: Strict access controls, real customer data

### Environment Variables
- Never commit `.env` files to git
- Use Vercel dashboard for environment variable management
- Rotate keys regularly, especially for production

### Access Control
- Limit production database access to essential team members
- Use service role keys carefully
- Monitor database access logs

## Monitoring and Maintenance

### Health Checks
- Monitor deployment status in Vercel dashboard
- Set up Supabase monitoring for database health
- Monitor application performance across environments

### Backup Strategy
- **Development**: No backup needed (test data)
- **Staging**: Weekly backups
- **Production**: Daily automated backups + manual backups before major deployments

### Update Process
- Test updates in development first
- Promote to staging for acceptance testing
- Deploy to production during maintenance windows

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check environment variables
vercel env ls

# Verify Supabase project status
# Check Supabase dashboard for project health

# Test local connection
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

#### Deployment Failures
```bash
# Check Vercel deployment logs
vercel logs

# Verify build process locally
npm run build

# Check for missing environment variables
```

#### Migration Issues
```bash
# Check current migration status
supabase migration list

# Apply specific migration
supabase migration up [migration-name]

# Reset and reapply all migrations (staging/dev only)
supabase db reset
```

## Best Practices

### Development
- Always test locally before pushing to development branch
- Use feature branches for experimental work
- Keep commits small and focused
- Write descriptive commit messages

### Database Management
- Never run destructive operations on production
- Always backup before major schema changes
- Test migrations on staging before production
- Keep development data minimal and focused

### Deployment
- Never deploy directly to production
- Always promote through the pipeline: dev → staging → production
- Use staging for acceptance testing
- Monitor deployments and be ready to rollback

### Security
- Regularly rotate API keys and database passwords
- Monitor access logs for unusual activity
- Keep dependencies updated
- Use HTTPS everywhere

## Contact and Support

### Team Responsibilities
- **UX Designer**: Design and user testing across environments
- **Developer**: Code deployment and database management
- **Product Manager**: Acceptance testing and production approval

### Emergency Procedures
- Production issues: Immediate rollback capability via Vercel
- Database issues: Contact Supabase support
- Critical bugs: Emergency hotfix process via direct production deployment

---

*Last Updated: [Current Date]*
*Document Version: 1.0*