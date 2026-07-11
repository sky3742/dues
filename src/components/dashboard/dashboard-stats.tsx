import { getDashboardStats } from "@/services/account";

export async function DashboardStats() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-300/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-base-content/5 flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <div className="text-xs text-base-content/60 uppercase tracking-wide">Total</div>
            <div className="text-2xl font-bold">{stats.activeCount}</div>
          </div>
        </div>
      </div>

      <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-300/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
            <span className="text-xl">🚨</span>
          </div>
          <div>
            <div className="text-xs text-base-content/60 uppercase tracking-wide">Overdue</div>
            <div className={`text-2xl font-bold ${stats.overdueCount > 0 ? "text-error" : ""}`}>
              {stats.overdueCount}
            </div>
          </div>
        </div>
      </div>

      <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-300/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <span className="text-xl">⏰</span>
          </div>
          <div>
            <div className="text-xs text-base-content/60 uppercase tracking-wide">Due Soon</div>
            <div className={`text-2xl font-bold ${stats.dueSoonCount > 0 ? "text-warning" : ""}`}>
              {stats.dueSoonCount}
            </div>
          </div>
        </div>
      </div>

      <div className="stat bg-base-100 rounded-xl shadow-sm border border-base-300/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <span className="text-xl">✅</span>
          </div>
          <div>
            <div className="text-xs text-base-content/60 uppercase tracking-wide">Paid</div>
            <div className="text-2xl font-bold text-success">{stats.paidCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
