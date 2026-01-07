import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Expense, UserProfile, Category } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserExpenses() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Expense[]>({
    queryKey: ['userExpenses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserExpenses();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { amount: number; description: string; date: bigint; source: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addExpense(params.amount, params.description, params.date, params.source);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
    },
  });
}

export function useGetExpenseSummaryByCategory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Category, number]>>({
    queryKey: ['expenseSummary'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpenseSummaryByCategory();
    },
    enabled: !!actor && !actorFetching,
  });
}
