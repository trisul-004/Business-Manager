# Employee Management System 🏢

A high-performance Site & Personnel Management system built for efficiency, security, and scalability. This application allows Supervisors to oversee multiple sites and Managers to handle day-to-day employee operations with ease.

## ✨ Key Features

### 🔐 Multi-Role Authentication
- **Supervisor Portal**: Full oversight of all sites, manager assignments, and workforce statistics.
- **Manager Portal**: Dashboard for specific site management and employee tracking.
- **Secure Access**: Integrated with **Clerk** for robust role-based access control (RBAC).

### 📍 Site & Workforce Management
- **Dynamic Site Creation**: Launch new sites instantly with beautiful oversight cards.
- **Manager Assignment**: Assign and unassign managers to specific sites using unique User IDs.
- **Employee Directory**: Manage on-site personnel with ease.

### 🎨 Modern User Interface
- **Premium Aesthetics**: Built with **Next.js 15**, **Tailwind CSS 4**, and **Lucide Icons**.
- **Intuitive UX**: Micro-interactions, hover states, and clipboard-copy functionality for IDs.
- **Fully Responsive**: Optimized for both desktop and mobile devices.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Neon PostgreSQL](https://neon.tech/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [Clerk](https://clerk.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/employee-management-system.git
cd employee-management-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
DATABASE_URL=postgresql://...
```

### 4. Push the database schema
```bash
npx drizzle-kit push
```

### 5. Start the development server
```bash
npm run dev
```

## 📋 Database Schema

The system uses a relational schema designed for speed:
- **`sites`**: Stores site information (name, address).
- **`site_managers`**: Maps Clerk User IDs to specific sites.
- **`employees`**: Stores site-specific personnel details.

## 🤝 Usage

1. **Sign Up**: Create an account via Clerk.
2. **Assign Roles**: Set the user role to `supervisor` or `manager` in the Clerk Dashboard (Metadata).
3. **Supervisor**: Use the **Supervisor Portal** to add sites and assign managers (Paste their Clerk User ID into the assignment field).
4. **Manager**: Access the **Manager Portal** to see your assigned sites and start adding your team members!

---

Built with ❤️ by your development assistant.
