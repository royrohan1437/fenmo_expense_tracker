import { useEffect, useState } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import AuthForm, { LoginData, RegisterData } from './components/AuthForm';
import ExpenseForm, { ExpenseInput } from './components/ExpenseForm';
import ExpenseList, { Expense } from './components/ExpenseList';
import { createExpense, fetchExpenses, fetchCategories } from './api/expenses';
import { login, register } from './api/auth';

function App() {
  const { user, token, login: authLogin, logout } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSortedByDate, setIsSortedByDate] = useState(false);

  useEffect(() => {
    if (!token) return;

    const loadExpenses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchExpenses(token, selectedCategory || undefined, isSortedByDate);
        setExpenses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load expenses');
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenses();
  }, [token, selectedCategory, isSortedByDate]);

  useEffect(() => {
    if (!token) return;

    const loadCategories = async () => {
      try {
        const cats = await fetchCategories(token);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, [token, expenses.length]);

  const handleAuth = async (data: LoginData | RegisterData) => {
    try {
      setAuthError(null);
      setAuthLoading(true);

      let result;
      if (isLoginMode) {
        result = await login((data as LoginData).email, (data as LoginData).password);
      } else {
        const regData = data as RegisterData;
        result = await register(regData.username, regData.email, regData.password, regData.confirmPassword);
      }

      authLogin(result.user, result.token);
      setExpenses([]);
      setCategories([]);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAddExpense = async (expense: ExpenseInput) => {
    if (!token) return;
    await createExpense(expense, token);
    const data = await fetchExpenses(token, selectedCategory || undefined, isSortedByDate);
    setExpenses(data);
  };

  if (!user || !token) {
    return (
      <AuthForm
        isLogin={isLoginMode}
        onToggleMode={() => setIsLoginMode(!isLoginMode)}
        onSubmit={handleAuth}
        isLoading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Wallet className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Expense Tracker</h1>
            </div>
            <p className="text-gray-600">Track your expenses and understand where your money goes</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-900">{user.username}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          <ExpenseForm onSubmit={handleAddExpense} />
          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            error={error}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            isSortedByDate={isSortedByDate}
            onToggleSort={() => setIsSortedByDate(!isSortedByDate)}
            categories={categories}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
