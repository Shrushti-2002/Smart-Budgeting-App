import { useGetExpenseSummaryByCategory, useGetUserExpenses } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Category } from '../backend';
import { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

const CATEGORY_COLORS: Record<Category, string> = {
  [Category.food]: 'oklch(0.646 0.222 41.116)',
  [Category.transportation]: 'oklch(0.6 0.118 184.704)',
  [Category.entertainment]: 'oklch(0.398 0.07 227.392)',
  [Category.shopping]: 'oklch(0.828 0.189 84.429)',
  [Category.bills]: 'oklch(0.769 0.188 70.08)',
  [Category.healthcare]: 'oklch(0.488 0.243 264.376)',
  [Category.other]: 'oklch(0.556 0 0)',
};

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.food]: 'Food',
  [Category.transportation]: 'Transportation',
  [Category.entertainment]: 'Entertainment',
  [Category.shopping]: 'Shopping',
  [Category.bills]: 'Bills',
  [Category.healthcare]: 'Healthcare',
  [Category.other]: 'Other',
};

type TimeRange = 'daily' | 'weekly' | 'monthly';

export default function Overview() {
  const { data: summary, isLoading: summaryLoading } = useGetExpenseSummaryByCategory();
  const { data: expenses, isLoading: expensesLoading } = useGetUserExpenses();
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  const totalSpending = useMemo(() => {
    return summary?.reduce((acc, [_, amount]) => acc + amount, 0) || 0;
  }, [summary]);

  const pieChartData = useMemo(() => {
    if (!summary) return [];
    return summary
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        name: CATEGORY_LABELS[category],
        value: amount,
        color: CATEGORY_COLORS[category],
      }));
  }, [summary]);

  const timeBasedData = useMemo(() => {
    if (!expenses) return [];

    const now = Date.now();
    const filtered = expenses.filter((expense) => {
      const expenseDate = Number(expense.date) / 1_000_000; // Convert nanoseconds to milliseconds
      const dayMs = 24 * 60 * 60 * 1000;

      switch (timeRange) {
        case 'daily':
          return now - expenseDate < 7 * dayMs;
        case 'weekly':
          return now - expenseDate < 4 * 7 * dayMs;
        case 'monthly':
          return now - expenseDate < 12 * 30 * dayMs;
        default:
          return true;
      }
    });

    const grouped = new Map<string, number>();

    filtered.forEach((expense) => {
      const expenseDate = new Date(Number(expense.date) / 1_000_000);
      let key: string;

      switch (timeRange) {
        case 'daily':
          key = expenseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'weekly':
          const weekStart = new Date(expenseDate);
          weekStart.setDate(expenseDate.getDate() - expenseDate.getDay());
          key = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          break;
        case 'monthly':
          key = expenseDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          break;
        default:
          key = 'Unknown';
      }

      grouped.set(key, (grouped.get(key) || 0) + expense.amount);
    });

    return Array.from(grouped.entries())
      .map(([period, amount]) => ({ period, amount }))
      .slice(-10);
  }, [expenses, timeRange]);

  if (summaryLoading || expensesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Transactions recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pieChartData.length}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="category" className="space-y-4">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="time">Over Time</TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Distribution of your expenses across categories</CardDescription>
            </CardHeader>
            <CardContent>
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No expenses to display
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Spending Over Time</CardTitle>
                  <CardDescription>Track your spending trends</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily (7d)</SelectItem>
                    <SelectItem value="weekly">Weekly (4w)</SelectItem>
                    <SelectItem value="monthly">Monthly (12m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {timeBasedData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={timeBasedData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="period" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Bar dataKey="amount" fill="oklch(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No expenses in this time range
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
