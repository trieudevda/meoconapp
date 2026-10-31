import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

import { MAX_VND_AMOUNT } from '@/utils/money';

export type TransactionType = 'Thu' | 'Chi';

export type Transaction = {
  id: number;
  name: string;
  category: string;
  note: string;
  amount: number;
  type: TransactionType;
  date: string;
};

export type ApprovalRequest = {
  id: number;
  name: string;
  link: string;
  description: string;
  price: number;
  status: 'Chờ duyệt' | 'Đã duyệt';
  category: string;
  color: string;
};

export type DashboardData = {
  monthlyExpense: number;
  monthChangeBasisPoints: number;
  requestsSubmitted: number;
  requestsApproved: number;
  requestsPending: number;
  weekChangeBasisPoints: number;
  dailyExpenses: number[];
  recentExpenses: {
    title: string;
    date: string;
    amount: number;
    icon: 'coffee' | 'payments';
    color: string;
    tint: string;
  }[];
};

export type AppSettings = {
  notificationsEnabled: boolean;
  currency: 'VND';
};

export type AppData = {
  dashboard: DashboardData;
  requests: ApprovalRequest[];
  transactions: Transaction[];
  settings: AppSettings;
};

export const demoAppData: AppData = {
  dashboard: {
    monthlyExpense: 12_480_000,
    monthChangeBasisPoints: -820,
    requestsSubmitted: 8,
    requestsApproved: 5,
    requestsPending: 3,
    weekChangeBasisPoints: -820,
    dailyExpenses: [420_000, 630_000, 500_000, 860_000, 690_000, 1_020_000, 700_000],
    recentExpenses: [
      {
        title: 'Cà phê & ăn sáng',
        date: 'Hôm nay · 08:42',
        amount: 85_000,
        icon: 'coffee',
        color: '#FFF1E8',
        tint: '#E18B50',
      },
      {
        title: 'Di chuyển',
        date: 'Hôm qua · 17:20',
        amount: 120_000,
        icon: 'payments',
        color: '#E8F1FC',
        tint: '#3478D4',
      },
    ],
  },
  requests: [
    {
      id: 1,
      name: 'Bàn phím cơ Keychron K2',
      link: 'https://example.com/keychron-k2',
      description: 'Bàn phím phục vụ công việc và học tập.',
      price: 2_490_000,
      status: 'Chờ duyệt',
      category: 'THIẾT BỊ',
      color: '#E8F1FC',
    },
    {
      id: 2,
      name: 'Khóa học thiết kế UI/UX',
      link: 'https://example.com/ui-ux-course',
      description: 'Khóa học nâng cao kỹ năng thiết kế sản phẩm.',
      price: 1_200_000,
      status: 'Đã duyệt',
      category: 'HỌC TẬP',
      color: '#E5F6EF',
    },
    {
      id: 3,
      name: 'Tai nghe chống ồn',
      link: 'https://example.com/headphones',
      description: 'Tai nghe dùng khi làm việc tại văn phòng.',
      price: 3_850_000,
      status: 'Chờ duyệt',
      category: 'CÔNG NGHỆ',
      color: '#FFF0E8',
    },
  ],
  transactions: [
    { id: 1, name: 'Lương tháng', category: 'Lương', note: 'Thu nhập công việc', amount: 18_000_000, type: 'Thu', date: 'Hôm nay' },
    { id: 2, name: 'Cà phê sáng', category: 'Ăn uống', note: '', amount: 65_000, type: 'Chi', date: 'Hôm nay' },
    { id: 3, name: 'Freelance thiết kế', category: 'Công việc', note: 'Dự án minh họa', amount: 2_500_000, type: 'Thu', date: 'Hôm qua' },
    { id: 4, name: 'Đi chợ cuối tuần', category: 'Sinh hoạt', note: 'Rau củ và đồ dùng', amount: 320_000, type: 'Chi', date: 'Hôm qua' },
  ],
  settings: {
    notificationsEnabled: true,
    currency: 'VND',
  },
};

type AppDataContextValue = {
  apiData: Partial<AppData>;
  setApiData: Dispatch<SetStateAction<Partial<AppData>>>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function validateVndAmounts(amounts: number[]) {
  for (const amount of amounts) {
    if (!Number.isSafeInteger(amount) || amount < 0 || amount > MAX_VND_AMOUNT) {
      throw new RangeError('API VND amounts must be non-negative safe integers within the supported limit.');
    }
  }
}

function limitArray<T>(items: T[], maxItems: number): T[] {
  return items.length > maxItems ? items.slice(0, maxItems) : items;
}

function prepareApiData(data: Partial<AppData>): Partial<AppData> {
  if (data.dashboard) {
    validateVndAmounts([
      data.dashboard.monthlyExpense,
      ...data.dashboard.dailyExpenses,
      ...data.dashboard.recentExpenses.map((expense) => expense.amount),
    ]);
    if (
      !Number.isSafeInteger(data.dashboard.monthChangeBasisPoints) ||
      !Number.isSafeInteger(data.dashboard.weekChangeBasisPoints)
    ) {
      throw new RangeError('API percentage changes must be integer basis points.');
    }
  }
  if (data.requests) validateVndAmounts(data.requests.map((request) => request.price));
  if (data.transactions) validateVndAmounts(data.transactions.map((item) => item.amount));

  return {
    ...data,
    dashboard: data.dashboard
      ? {
          ...data.dashboard,
        dailyExpenses: limitArray(data.dashboard.dailyExpenses, 7),
        recentExpenses: limitArray(data.dashboard.recentExpenses, 5),
        }
      : undefined,
    requests: data.requests ? limitArray(data.requests, 50) : undefined,
    transactions: data.transactions ? limitArray(data.transactions, 50) : undefined,
  };
}

export function AppDataProvider({ children }: PropsWithChildren) {
  const [apiData, setApiDataState] = useState<Partial<AppData>>({});
  const setApiData = useCallback<Dispatch<SetStateAction<Partial<AppData>>>>((update) => {
    setApiDataState((current) => {
      const nextUpdate = typeof update === 'function' ? update(current) : update;
      return prepareApiData({ ...current, ...nextUpdate });
    });
  }, []);
  const value = useMemo(() => ({ apiData, setApiData }), [apiData, setApiData]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppDataStore() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppDataStore must be used inside AppDataProvider.');
  }
  return context;
}

export function useAppSectionState<K extends keyof AppData>(section: K) {
  const { apiData } = useAppDataStore();
  const responseData = apiData[section];
  return {
    data: responseData ?? demoAppData[section],
    isFromApi: responseData !== undefined,
  };
}

export function useAppSection<K extends keyof AppData>(section: K): AppData[K] {
  return useAppSectionState(section).data;
}

export function useSessionData<T>(
  source: T[],
  maxItems: number,
): [T[], Dispatch<SetStateAction<T[]>>] {
  const [snapshot, setSnapshot] = useState({ source, data: source.slice(0, maxItems) });
  const data = snapshot.source === source ? snapshot.data : source.slice(0, maxItems);
  const setData = useCallback<Dispatch<SetStateAction<T[]>>>(
    (update) => {
      setSnapshot((current) => {
        const currentData =
          current.source === source ? current.data : source.slice(0, maxItems);
        const nextData = typeof update === 'function' ? update(currentData) : update;
        return { source, data: nextData.slice(0, maxItems) };
      });
    },
    [source, maxItems],
  );

  return [data, setData];
}
