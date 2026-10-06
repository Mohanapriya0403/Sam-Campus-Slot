import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  LogIn,
  KeyRound,
  Shield,
  GraduationCap,
  User,
  Filter,
  ArrowUpDown,
  X,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import { getUsers } from '../../api/users';
import { useApi } from '../../hooks/useApi';

export default function ManageUsers() {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'student' | 'faculty' | 'admin'
  const [deptFilter, setDeptFilter] = useState('all');
  const [authFilter, setAuthFilter] = useState('all'); // 'all' | 'google' | 'local'
  const [sortField, setSortField] = useState('name'); // 'name' | 'role' | 'department' | 'email'
  const [sortAsc, setSortAsc] = useState(true);

  const { data, loading } = useApi(() => getUsers(), []);
  const users = data || [];

  // Compute counts for quick filter buttons
  const counts = useMemo(() => {
    const total = users.length;
    const students = users.filter((u) => u.role === 'student').length;
    const faculty = users.filter((u) => u.role === 'faculty').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    return { total, students, faculty, admins };
  }, [users]);

  // Extract distinct departments for the department filter
  const departments = useMemo(() => {
    const set = new Set(users.map((u) => u.department).filter(Boolean));
    return Array.from(set).sort();
  }, [users]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase().trim();

    return users
      .filter((u) => {
        // Role filter
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;

        // Department filter
        if (deptFilter !== 'all' && u.department !== deptFilter) return false;

        // Auth provider filter
        if (authFilter !== 'all') {
          const provider = u.authProvider || 'local';
          if (authFilter === 'google' && provider !== 'google') return false;
          if (authFilter === 'local' && provider === 'google') return false;
        }

        // Query search
        if (!q) return true;
        const nameMatch = (u.name || '').toLowerCase().includes(q);
        const emailMatch = (u.email || '').toLowerCase().includes(q);
        const deptMatch = (u.department || '').toLowerCase().includes(q);
        const roleMatch = (u.role || '').toLowerCase().includes(q);
        const yearMatch = (u.year || '').toLowerCase().includes(q);

        return nameMatch || emailMatch || deptMatch || roleMatch || yearMatch;
      })
      .sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';

        if (sortField === 'role') {
          // Hierarchy order: admin -> faculty -> student
          const weight = { admin: 1, faculty: 2, student: 3 };
          valA = weight[a.role] || 4;
          valB = weight[b.role] || 4;
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [users, query, roleFilter, deptFilter, authFilter, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const resetFilters = () => {
    setQuery('');
    setRoleFilter('all');
    setDeptFilter('all');
    setAuthFilter('all');
  };

  const isFiltered = query || roleFilter !== 'all' || deptFilter !== 'all' || authFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Users className="text-brand-600" size={26} /> User Management
          </h1>
          <Badge tone="brand" className="text-xs">
            {users.length} Registered
          </Badge>
        </div>
        <p className="text-ink-500 dark:text-ink-400 text-sm">
          Filter and manage campus accounts across students, faculty, and administrators.
        </p>
      </div>

      {/* Role Quick-Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setRoleFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            roleFilter === 'all'
              ? 'bg-brand-50/80 border-brand-500 dark:bg-brand-950/40 dark:border-brand-500 shadow-sm ring-1 ring-brand-500'
              : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-brand-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center text-ink-600 dark:text-ink-300">
              <Users size={16} />
            </div>
            {roleFilter === 'all' && (
              <span className="w-2 h-2 rounded-full bg-brand-600" />
            )}
          </div>
          <p className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">{counts.total}</p>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 font-medium">All Users</p>
        </button>

        <button
          onClick={() => setRoleFilter('student')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            roleFilter === 'student'
              ? 'bg-blue-50/80 border-blue-500 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm ring-1 ring-blue-500'
              : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User size={16} />
            </div>
            {roleFilter === 'student' && (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </div>
          <p className="font-display text-2xl font-bold text-blue-700 dark:text-blue-300">{counts.students}</p>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 font-medium">Students</p>
        </button>

        <button
          onClick={() => setRoleFilter('faculty')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            roleFilter === 'faculty'
              ? 'bg-purple-50/80 border-purple-500 dark:bg-purple-950/40 dark:border-purple-500 shadow-sm ring-1 ring-purple-500'
              : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <GraduationCap size={16} />
            </div>
            {roleFilter === 'faculty' && (
              <span className="w-2 h-2 rounded-full bg-purple-600" />
            )}
          </div>
          <p className="font-display text-2xl font-bold text-purple-700 dark:text-purple-300">{counts.faculty}</p>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 font-medium">Faculty</p>
        </button>

        <button
          onClick={() => setRoleFilter('admin')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            roleFilter === 'admin'
              ? 'bg-emerald-50/80 border-emerald-500 dark:bg-emerald-950/40 dark:border-emerald-500 shadow-sm ring-1 ring-emerald-500'
              : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Shield size={16} />
            </div>
            {roleFilter === 'admin' && (
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            )}
          </div>
          <p className="font-display text-2xl font-bold text-emerald-700 dark:text-emerald-300">{counts.admins}</p>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 font-medium">Administrators</p>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search by name, email, register number, department..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 focus:outline-none focus:border-brand-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Column Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Role Filter Dropdown */}
            <div className="w-36">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs"
              >
                <option value="all">Role: All ({counts.total})</option>
                <option value="student">Student ({counts.students})</option>
                <option value="faculty">Faculty ({counts.faculty})</option>
                <option value="admin">Admin ({counts.admins})</option>
              </Select>
            </div>

            {/* Department Filter Dropdown */}
            <div className="w-40">
              <Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="text-xs"
              >
                <option value="all">Dept: All</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </div>

            {/* Auth Provider Filter */}
            <div className="w-36">
              <Select
                value={authFilter}
                onChange={(e) => setAuthFilter(e.target.value)}
                className="text-xs"
              >
                <option value="all">Sign-in: All</option>
                <option value="google">Google SSO</option>
                <option value="local">Password</option>
              </Select>
            </div>

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-xs font-semibold text-ink-500 hover:text-brand-600 transition-colors flex items-center gap-1"
              >
                <X size={13} /> Reset
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400 px-1">
        <span>
          Showing <span className="font-semibold text-ink-800 dark:text-ink-200">{filteredUsers.length}</span> of{' '}
          {users.length} users
          {roleFilter !== 'all' && (
            <span className="ml-1 font-medium capitalize text-brand-600 dark:text-brand-400">
              ({roleFilter}s only)
            </span>
          )}
        </span>
        <span className="text-ink-400">Click column header to sort</span>
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <Card className="p-8 text-center">
          <EmptyState
            icon={Users}
            title="No matching users found"
            description="Try selecting a different role or clearing the search query."
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 dark:bg-ink-800/70 text-ink-600 dark:text-ink-300 text-left text-xs uppercase tracking-wider font-semibold border-b border-ink-100 dark:border-ink-800">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-ink-100/60 dark:hover:bg-ink-800 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Name</span>
                    <ArrowUpDown size={12} className={sortField === 'name' ? 'text-brand-600' : 'text-ink-400'} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('email')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-ink-100/60 dark:hover:bg-ink-800 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Email / College ID</span>
                    <ArrowUpDown size={12} className={sortField === 'email' ? 'text-brand-600' : 'text-ink-400'} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('role')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-ink-100/60 dark:hover:bg-ink-800 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role</span>
                    <ArrowUpDown size={12} className={sortField === 'role' ? 'text-brand-600' : 'text-ink-400'} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('department')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-ink-100/60 dark:hover:bg-ink-800 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Department & Year</span>
                    <ArrowUpDown size={12} className={sortField === 'department' ? 'text-brand-600' : 'text-ink-400'} />
                  </div>
                </th>
                <th className="px-4 py-3.5">Sign-in Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800 text-xs sm:text-sm">
              {filteredUsers.map((u) => {
                const isStudent = u.role === 'student';
                const isFaculty = u.role === 'faculty';
                const isAdmin = u.role === 'admin';

                return (
                  <tr key={u.id} className="hover:bg-ink-50/70 dark:hover:bg-ink-850/60 transition-colors">
                    {/* User Name & Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                          style={{ backgroundColor: u.avatarColor || '#3B82F6' }}
                        >
                          {u.name?.charAt(0) || 'U'}
                        </span>
                        <div>
                          <p className="font-semibold text-ink-900 dark:text-ink-100">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-ink-400 sm:hidden">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 font-mono text-xs text-ink-600 dark:text-ink-400">
                      {u.email}
                    </td>

                    {/* Role Badge */}
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Shield size={12} /> Admin
                        </span>
                      )}
                      {isFaculty && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <GraduationCap size={12} /> Faculty
                        </span>
                      )}
                      {isStudent && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <User size={12} /> Student
                        </span>
                      )}
                    </td>

                    {/* Department & Year */}
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{u.department || '—'}</span>
                        {u.year && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-ink-100 dark:bg-ink-800 text-ink-500">
                            {u.year}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Sign-in Method */}
                    <td className="px-4 py-3">
                      {u.authProvider === 'google' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                          <LogIn size={13} /> Google SSO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                          <KeyRound size={13} /> Password
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
