import { useState } from 'react';
import { useAddExpense } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, FileText } from 'lucide-react';

export default function ImportCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const addExpense = useAddExpense();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
      e.target.value = '';
    }
  };

  const parseCSV = (text: string): Array<{ amount: number; description: string; date: Date }> => {
    const lines = text.split('\n').filter((line) => line.trim());
    const expenses: Array<{ amount: number; description: string; date: Date }> = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing (handles basic cases)
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));

      if (values.length >= 3) {
        const amount = parseFloat(values[0]);
        const description = values[1];
        const dateStr = values[2];

        if (!isNaN(amount) && description && dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            expenses.push({ amount, description, date });
          }
        }
      }
    }

    return expenses;
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsProcessing(true);

    try {
      const text = await file.text();
      const expenses = parseCSV(text);

      if (expenses.length === 0) {
        toast.error('No valid expenses found in CSV');
        setIsProcessing(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const expense of expenses) {
        try {
          const dateNano = BigInt(expense.date.getTime()) * BigInt(1_000_000);
          await addExpense.mutateAsync({
            amount: expense.amount,
            description: expense.description,
            date: dateNano,
            source: 'csv',
          });
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Failed to add expense:', error);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} expense${successCount > 1 ? 's' : ''}`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} expense${errorCount > 1 ? 's' : ''}`);
      }

      setFile(null);
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast.error('Failed to process CSV file');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import CSV
        </CardTitle>
        <CardDescription>Upload a CSV file with your transactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-file">CSV File</Label>
          <div className="flex items-center gap-2">
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="cursor-pointer"
            />
          </div>
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <FileText className="w-4 h-4" />
              <span>{file.name}</span>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
          <p className="font-medium">CSV Format:</p>
          <p className="text-muted-foreground">
            Your CSV should have columns: <strong>amount, description, date</strong>
          </p>
          <p className="text-muted-foreground text-xs">
            Example: 25.50, "Grocery shopping", 2025-01-04
          </p>
        </div>

        <Button onClick={handleImport} className="w-full" disabled={!file || isProcessing}>
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Processing...
            </>
          ) : (
            'Import Expenses'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
