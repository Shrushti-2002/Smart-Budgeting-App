import { useState } from 'react';
import { useAddExpense } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function AddExpense() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const addExpense = useAddExpense();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      const dateObj = new Date(date);
      const dateNano = BigInt(dateObj.getTime()) * BigInt(1_000_000);

      await addExpense.mutateAsync({
        amount: amountNum,
        description: description.trim(),
        date: dateNano,
        source: 'manual',
      });

      toast.success('Expense added successfully!');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      toast.error('Failed to add expense');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Expense
        </CardTitle>
        <CardDescription>Manually add a new expense</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={addExpense.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="e.g., Grocery shopping at Walmart"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={addExpense.isPending}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={addExpense.isPending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={addExpense.isPending}>
            {addExpense.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Adding...
              </>
            ) : (
              'Add Expense'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
