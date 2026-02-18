import { Filter, ArrowDownUp } from 'lucide-react';

export interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isSortedByDate: boolean;
  onToggleSort: () => void;
  categories: string[];
}

export default function ExpenseList({
  expenses,
  isLoading,
  error,
  selectedCategory,
  onCategoryChange,
  isSortedByDate,
  onToggleSort,
  categories,
}: ExpenseListProps) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onToggleSort}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <ArrowDownUp className="w-4 h-4" />
            {isSortedByDate ? 'Newest First' : 'Latest Added'}
          </button>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="text-sm text-blue-700 font-medium">
          Total: <span className="text-2xl font-bold text-blue-900">₹{total.toFixed(2)}</span>
        </div>
        <div className="text-xs text-blue-600 mt-1">
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {selectedCategory
            ? `No expenses found in "${selectedCategory}" category`
            : 'No expenses yet. Add your first expense above!'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Description</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(expense.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">{expense.description}</td>
                  <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                    ₹{expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
