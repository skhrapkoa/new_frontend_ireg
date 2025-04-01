import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// Project-imports
import { fetcher } from 'utils/axios';

const initialState = {
  isDashboardDrawerOpened: false,
  isComponentDrawerOpened: true
};

export const endpoints = {
  key: 'api/menu',
  master: 'master',
  dashboard: '/dashboard' // server URL
};

const staticMenuItem = {
  id: 'invoice1',
  title: 'invoice',
  type: 'item',
  url: '/dashboard/invoice',
  breadcrumbs: false
};

// Статическое меню дашборда, не требующее API-запросов
const staticDashboardMenu = {
  id: 'dashboard',
  title: 'dashboard',
  type: 'group',
  icon: 'dashboard',
  children: [
    {
      id: 'dashboard',
      title: 'dashboard',
      type: 'collapse',
      icon: 'dashboard',
      children: [
        staticMenuItem
      ]
    }
  ]
};

export function useGetMenu() {
  // Возвращаем статический объект меню вместо запроса к API
  const memoizedValue = useMemo(() => {
    return {
      menu: staticDashboardMenu,
      menuLoading: false,
      menuError: null,
      menuValidating: false,
      menuEmpty: false
    };
  }, []);

  return memoizedValue;
}

export function useGetMenuMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.master, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      menuMaster: data,
      menuMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerComponentDrawer(isComponentDrawerOpened) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      return { ...currentMenuMaster, isComponentDrawerOpened };
    },
    false
  );
}

export function handlerDrawerOpen(isDashboardDrawerOpened) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      return { ...currentMenuMaster, isDashboardDrawerOpened };
    },
    false
  );
}
