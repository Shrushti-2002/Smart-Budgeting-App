import { useGetUserExpenses } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '../backend';
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.food]: 'Food',
  [Category.transportation]: 'Transportation',
  [Category.entertainment]: 'Entertainment',
  [Category.shopping]: 'Shopping',
  [Category.bills]: 'Bills',
  [Category.healthcare]: 'Healthcare',
  [Category.other]: 'Other',
};

const CATEGORY_VARIANTS: Record<Category, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [Category.food]: 'default',
  [Category.transportation]: 'secondary',
  [Category.entertainment]: 'outline',
  [Category.shopping]: 'default',
  [Category.bills]: 'destructive',
  [Category.healthcare]: 'secondary',
  [Category.other]: 'outline',
};
